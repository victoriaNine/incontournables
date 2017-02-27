// Librairies
import { createStore }                                     from "redux";
import { map, find, take, clone, clamp, debounce } from "lodash";

// Modules
import Events from "./events";

// Constantes
const START_TIME = Date.now();
const TMDB_API   = "https://api.themoviedb.org/3/";
const API_KEY    = "92b418e837b833be308bbfb1fb2aca1e";
const YEAR       = 2016;
const REGION     = "FR";
const LANGUAGE   = "fr-FR";


// Modules de l'utilitaire
let app = Object.create(null, {
    name         : { value: "incontournables" },
    currentTime  : { get: getCurrentTime },
    viewportSize : { value: { width: 1920, height: 950 }},
    topLength    : { value: 10 }
});

let utils = {
    getConfig,
    getPopular,
    getGenres,
    getPictures,
    getInfo,
    getFormattedRuntime,

    detectScreenChange
};

let debug = {
    debugMode: false,
    log,
    warn,
    error
};

let state = {
    popular      : {},
    genres       : {},
    appScalar    : 1,
    movieWatched : 0,
    tvWatched    : 0,
    activeTop    : "movie",
    tops         : {
        movie : [],
        tv    : []
    }
};

let events = clone(Events);
let _$     = {
    app,
    state,
    utils,
    debug,
    events
};

// Store React
let store;

/* REDUCER */
function storeReducer (state = _$, action = {}) {
    var newStore = Object.assign({}, state);

    if (action.type === "setConfig") {
        newStore.app.apiConfig = action.data;
    } else if (action.type === "setPopular") {
        newStore.state.popular = action.data;
    } else if (action.type === "setPopularMovie") {
        newStore.state.popular.movie = action.data;
    } else if (action.type === "setPopularTV") {
        newStore.state.popular.tv = action.data;
    } else if (action.type === "setGenres") {
        newStore.state.genres = action.data;
    } else if (action.type === "setGenresMovie") {
        newStore.state.genres.movie = action.data;
    } else if (action.type === "setGenresTV") {
        newStore.state.genres.tv = action.data;
    } else if (action.type === "setTopMovie") {
        newStore.state.tops.movie[action.data.index] = action.data.info;
    } else if (action.type === "setTopTV") {
        newStore.state.tops.tv[action.data.index] = action.data.info;
    } else if (action.type === "setScalar") {
        newStore.state.appScalar = action.data;
    } else if (action.type === "setWindowSize") {
        newStore.state.windowSize = action.data;
        newStore.events.trigger("resize", action.data);
    } else if (action.type === "updateMovieWatchedCount") {
        if (action.data.state) {
            newStore.state.movieWatched++;
        } else {
            newStore.state.movieWatched--;
        }

        newStore.state.movieWatched = clamp(newStore.state.movieWatched, 0, _$.app.topLength);
    }

    return newStore;
}

/* TEMPS */
function getCurrentTime () {
    return parseInt(Date.now() - START_TIME, 10);
}

function getFormattedRuntime (runtime) {
    var mins = runtime % 60;
    mins = (mins < 10) ? "0" + mins : mins;

    return `${ Math.floor(runtime / 60) }h${ mins }`;
}

/* LOGGING */
function log ()   { _makeLog("log", arguments); }
function warn ()  { _makeLog("warn", arguments); }
function error () { _makeLog("error", arguments); }

function _makeLog (type, message) {
    var log = [_$.app.currentTime.toString()].concat(Array.prototype.slice.call(message));
    if (_$.debug.debugMode) {
        console[type].apply(null, log);
    }
}

/* API TMDB */
function getConfig () {
    return fetch(`${ TMDB_API }configuration?&api_key=${ API_KEY }`)
          .then((response) => response.json());
}

function getPopular (type = "movie") {
    return fetch(`${ TMDB_API }discover/${ type }?year=${ YEAR }&page=1&include_video=false&include_adult=false&sort_by=popularity.desc&region=${ REGION }&language=${ LANGUAGE }&api_key=${ API_KEY }`)
          .then((response) => response.json());
}

function getGenres (type = "movie") {
    return fetch(`${ TMDB_API }genre/${ type }/list?language=${ LANGUAGE }&api_key=${ API_KEY }`)
          .then((response) => response.json());
}

function getInfo (type = "movie", id = null) {
    let state = store.getState().state;
    let item  = find(state.popular[type], { id });

    if (isNaN(parseFloat(id)) || !isFinite(id) || !item) {
        _$.debug.error("getDetails: Invalid ID", id);
        return false;
    }

    let info = {};

    const getDetails = () => {
        return fetch(`${ TMDB_API + type }/${ id }?language=${ LANGUAGE }&api_key=${ API_KEY }`);
    };

    const getCast = () => {
        return fetch(`${ TMDB_API + type }/${ id }/credits?language=${ LANGUAGE }&api_key=${ API_KEY }`);
    };

    const getVideo = () => {
        return fetch(`${ TMDB_API + type }/${ id }/videos?&api_key=${ API_KEY }`);
    };

    return getDetails().then((response) => response.json()).then((data) => {
        info.genres  = map(data.genres, "name");
        info.runtime = data.runtime;
    }).then(getCast).then((response) => response.json()).then((data) => {
        info.cast = map(take(data.cast, 3), "name");
    }).then(getVideo).then((response) => response.json()).then((data) => {
        let videoInClientLanguage = find(data.results, { iso_3166_1: LANGUAGE });

        if (videoInClientLanguage) {
            info.video = videoInClientLanguage.key;
        } else {
            info.video = data.results[0].key;
        }

        return info;
    });
}

function getPictures (type = "movie", id = null) {
    let item = find(store.getState().state.popular[type], { id });

    if (isNaN(parseFloat(id)) || !isFinite(id) || !item) {
        _$.debug.error("getPictures: Invalid ID", id);
        return false;
    }

    let url = store.getState().app.apiConfig.images.secure_base_url;

    return {
        poster   : url + "w640" + item.poster_path,
        backdrop : url + "w1300_and_h730_bestv2" + item.backdrop_path
    };
}

function detectScreenChange (el, direction, callback, context, axis = "y") {
    // Evenements tactiles
    var touchstartX = 0;
    var touchstartY = 0;
    var touchendX   = 0;
    var touchendY   = 0;

    el.addEventListener("touchstart", (e) => {
        if (!context.eventsEnabled) {
            return false;
        }

        touchstartX = e.touches[0].pageX;
        touchstartY = e.touches[0].pageY;
    }, false);

    el.addEventListener("touchend", (e) => {
        if (!context.eventsEnabled) {
            return false;
        }

        touchendX = e.changedTouches[0].pageX;
        touchendY = e.changedTouches[0].pageY;

        if ((direction === "next" && ((axis === "x" && touchendX > touchstartX) || (axis === "y" && touchendY < touchstartY))) ||
            (direction === "prev" && ((axis === "x" && touchendX < touchstartX) || (axis === "y" && touchendY < touchstartY)))) {
            e.preventDefault();
            callback(e);
        }
    }, false); 

    // Molette souris (avec debounce sur l'ecouteur)
    let wheelEventName = "onmousewheel" in window ? "mousewheel" : "wheel";
    el.addEventListener(wheelEventName, debounce((e) => {
        e.preventDefault();
        if (!context.eventsEnabled) {
            return false;
        }

        if ((direction === "next" && ((axis === "y" && e.deltaY > 0) || (axis === "x" && e.deltaX > 0))) ||
            (direction === "prev" && ((axis === "y" && e.deltaY < 0) || (axis === "x" && e.deltaX < 0)))) {
            callback(e);
        }
    }, 500, {
      "leading"  : true,
      "trailing" : false,
      "maxWait"  : 2000
    }), false); 
}

store = createStore(storeReducer);
export default store;
