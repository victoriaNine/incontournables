// Librairies
import React, { Component }   from "react";
import ReactDOM               from "react-dom";
import { Provider }           from "react-redux";
import { take, each, extend } from "lodash";

// Composants UI
import ElemHeader     from "./js/ui/ui_ElemHeader";
import ScreenHome     from "./js/ui/ui_ScreenHome";
import ScreenTopMovie from "./js/ui/ui_ScreenTopMovie";

// Modules
import store from "./js/modules/store";

// CSS
import "./css/main.css";

class App extends Component {
    constructor (props) {
        super(props);

        this.screens = {};
        store.getState().events.on("transitionScreen", this.onTransition, this);
    }
    componentDidMount () {
        this.screens.home.eventsEnabled = true;
    }

    render () {
        return (
            <div id="app" ref={ (ref) => this.el = ref }>
                <ElemHeader ref={ (ref) => this.elemHeader = ref } />
                <div id="fullPageWrapper" className="screen">
                    <ScreenHome ref={ (ref) => this.screens.home = ref } />
                    <div id="topScreensWrapper" className="screen">
                        <ScreenTopMovie ref={ (ref) => this.screens.topMovie = ref } />
                    </div>
                </div>
            </div>
        );
    }

    onTransition (event, data) {
        this.screens[data.fromScreen].eventsEnabled = false;
        this.screens[data.toScreen].eventsEnabled   = true;
    }
}

function launch () {
    const storeState = store.getState();
    let promises     = [];

    // On récupère les informations de configuration de l'API
    storeState.utils.getConfig().then((data) => {
        store.dispatch({ type: "setConfig", data });

        // Puis la liste des films et series populaires
        promises.push(storeState.utils.getPopular("movie").then((data) => {
            store.dispatch({ type: "setPopularMovie", data: data.results });
        }));

        promises.push(storeState.utils.getPopular("tv").then((data) => {
            store.dispatch({ type: "setPopularTV", data: data.results });
        }));

        Promise.all(promises).then((responses) => {
            let info;

            // Une fois fait, on crée les tops pour chacune des catégories
            each(take(storeState.state.popular.movie, storeState.app.topLength), (movie, index) => {
                info = extend({
                    type     : "movie",
                    id       : movie.id,
                    title    : movie.title,
                    overview : movie.overview
                }, storeState.utils.getPictures("movie", movie.id));

                store.dispatch({ type: "setTopMovie", data: { index, info } });
            });

            each(take(storeState.state.popular.tv, storeState.app.topLength), (tv, index) => {
                info = extend({
                    type     : "tv",
                    id       : tv.id,
                    title    : tv.title,
                    overview : tv.overview
                }, storeState.utils.getPictures("tv", tv.id));

                store.dispatch({ type: "setTopTV", data: { index, info } });
            });

            ReactDOM.render(
                <Provider store={ store }>
                    <App />
                </Provider>,
                document.getElementById("root")
            );
        });
    });
}

function setupScale () {
    // Rescale pour uniformiser le viewport sur tous les supports (en se basant sur le design d'origine pour 1920x1080)
    const VIEWPORT_SIZE = store.getState().app.viewportSize;

    function pixelRatioAdjust (forceSize) {
        var html             = document.querySelector("html");
        var body             = document.body;
        var devicePixelRatio = window.devicePixelRatio = window.devicePixelRatio || 1;

        window.screen                = window.screen || {};
        window.screen.actualWidth    = window.screen.width * devicePixelRatio;
        window.screen.actualHeight   = window.screen.height * devicePixelRatio;
        window.screen.viewportWidth  = VIEWPORT_SIZE.width;
        window.screen.viewportHeight = VIEWPORT_SIZE.height;

        var scalar = 1 / devicePixelRatio;
        var offset = (devicePixelRatio * 100 - 100) / 2;
        var width;
        var height;

        if (forceSize) {
            html.style.transformOrigin = "0 0";
            window.addEventListener("resize", reScale);
            reScale();
        } else {
            width              = window.innerWidth * devicePixelRatio;
            height             = window.innerHeight * devicePixelRatio;
            html.style.width   = width + "px";
            html.style.height  = height + "px";
            
            store.dispatch({ type: "setScalar", data: 1 });
            store.dispatch({ type: "setWindowSize", data: { width, height } });
        }

        body.style.transform = "scale(" + scalar + ") translate(-" + offset + "%, -" + offset + "%)";

        function reScale () {
            var fullWidth  = window.innerWidth * devicePixelRatio;
            var fullHeight = window.innerHeight * devicePixelRatio;
            var scalarW = fullWidth / VIEWPORT_SIZE.width;
            var scalarH = fullHeight / VIEWPORT_SIZE.height;
            var scalar;
            var width;
            var height;

            if (scalarW < scalarH) {
                scalar = scalarW;
                width  = VIEWPORT_SIZE.width;
                height = (window.innerHeight * devicePixelRatio) / scalar;
            } else {
                scalar = scalarH;
                width  = (window.innerWidth * devicePixelRatio) / scalar;
                height = VIEWPORT_SIZE.height;
            }

            html.style.width     = width + "px";
            html.style.height    = height + "px";
            html.style.transform = "scale(" + scalar + ")";

            store.dispatch({ type: "setScalar", data: scalar });
            store.dispatch({ type: "setWindowSize", data: { width, height } });
        }
    }

    pixelRatioAdjust(true);
}

setupScale();
launch();
