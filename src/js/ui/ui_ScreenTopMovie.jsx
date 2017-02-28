// Librairies
import React, { Component }         from "react";
import { TimelineMax, TweenMax }    from "gsap";
import { each, clamp, extend, map } from "lodash";

// Modules
import store from "../modules/store";

// Composants UI
import ElemTopItem from "./ui_ElemTopItem";

const storeState = store.getState();

class ScreenTopMovie extends Component {
    constructor (props) {
        super(props);

        this.eventsEnabled    = false;
        this.isTransitioning  = false;
        this.totalItems       = storeState.state.tops.movie.length;
        this.currentIndex     = 0;
        this.endReached       = false;
        this.isViewingDetails = false;
        this.state = {
            movieDetails : {},
            scoreDisplay : this.getScoreDisplay()
        };

        store.getState().events.on("updateMovieWatchedCount", this.onCountUpdate, this);
        store.getState().events.on("viewDetails", this.openDetails, this);
    }

    componentDidMount () {
        // Ajout de la detection de mouvement vers un autre ecran
        storeState.utils.detectScreenChange(this.el, "prev", this.screenTransition.bind(this, 1, "topMovie", "home"), this); 
        storeState.utils.detectScreenChange(this.el, "prev", this.onPageChange.bind(this, "prev"), this, "x"); 
        storeState.utils.detectScreenChange(this.el, "next", this.onPageChange.bind(this, "next"), this, "x"); 

        each(this.el.querySelectorAll(".topMovie_pagination-element"), (item, index) => {
            item.classList.remove("is--active");

            item.addEventListener("click", this.itemTransition.bind(this, index));
            item.addEventListener("touchend", this.itemTransition.bind(this, index));
        });

        this.el.querySelector(".topMovie_nav-prev").addEventListener("click", this.onPageChange.bind(this, "prev"));
        this.el.querySelector(".topMovie_nav-prev").addEventListener("touchend", this.onPageChange.bind(this, "prev"));
        this.el.querySelector(".topMovie_nav-next").addEventListener("click", this.onPageChange.bind(this, "next"));
        this.el.querySelector(".topMovie_nav-next").addEventListener("touchend", this.onPageChange.bind(this, "next"));

        storeState.events.on("resize", (events, data) => {
            if (this.eventsEnabled) {
                TweenMax.set("#fullPageWrapper", { y: -1 * data.height });
            }

            TweenMax.set(".topMovie_listWrapper", { x: -1 * this.currentIndex * data.width });
        });

        this.updatePage();
    }

    render () {
        let movieDetailsDom = null;
        if (this.isViewingDetails) {
            movieDetailsDom = (
                <div className="topMovie_details" ref={ (ref) => this.detailsOverlay = ref }>
                    <div className="topMovie_details-video">
                        <iframe id="ytplayer" type="text/html" width={ storeState.app.viewportSize.height * (16 / 9) } height={ storeState.app.viewportSize.height }
                        src={ `https://www.youtube.com/embed/${ this.state.movieDetails.video }?autoplay=1&enablejsapi=1&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3` }
                        frameBorder="0" allowFullScreen />
                    </div>
                    <div className="topMovie_details-content">
                        <img className="topMovie_details-content-poster" src={ this.state.movieDetails.poster } />
                        <div className="topMovie_details-content-text">
                            <div className="topMovie_details-content-text-header">
                                <div className="topMovie_details-content-text-header-title">{ this.state.movieDetails.title }</div>
                                <div className="topMovie_details-content-text-header-cta">
                                    <a href="http://www.mycanal.fr/" target="_blank">Regarder maintenant sur myCanal</a>
                                </div>
                            </div>
                            <div className="topMovie_details-content-text-info">
                                <span className="topMovie_details-content-text-info-cast">Avec { this.state.movieDetails.cast.join(", ") }</span>
                                <span className="topMovie_details-content-text-info-genres"> | { this.state.movieDetails.genres.join(", ") }</span>
                                <span className="topMovie_details-content-text-info-runtime"> | { storeState.utils.getFormattedRuntime(this.state.movieDetails.runtime) }</span>
                            </div>
                            <div className="topMovie_details-content-text-overview">
                                { this.state.movieDetails.overview }
                            </div>
                        </div>
                    </div>
                    <ul className="topMovie_details-menu">
                        <li className="topMovie_details-menu-element topMovie_details-menu-close" ref={ (ref) => this.detailsCloseTrigger = ref } onClick={this.closeDetails.bind(this)}>
                            <i className="fa fa-times-circle"></i>
                        </li>
                        <li className="topMovie_details-menu-element topMovie_details-menu-toggleInfo" ref={ (ref) => this.toggleInfoTrigger = ref } onClick={this.toggleInfo.bind(this)}>
                            <i className="fa fa-info-circle"></i>
                        </li>
                    </ul>
                </div>
            );
        }

        let items = map(storeState.state.tops.movie, (item, index) => {
            return <ElemTopItem info={ item } key={ item.id } position={ index } ref={ "item_" + index } />;
        });

        let pagination = [];
        for (var i = 0, ii = this.totalItems; i < ii; i++) {
            pagination.push(
                <li className={ `topMovie_pagination-element topMovie_pagination-${ i + 1 }` } key={ i }>
                    { (i + 1) < 10 ? "0" + (i + 1) : (i + 1) }
                </li>
            );
        }

        return (
            <section id="screen_topMovie" className="screen" ref={ (ref) => this.el = ref }>
                <div className="topMovie_listWrapper">
                    { items }
                </div>
                <div className="topMovie_nav-element topMovie_nav-prev"><i className="fa fa-chevron-circle-left"></i></div>
                <div className="topMovie_nav-element topMovie_nav-next"><i className="fa fa-chevron-circle-right"></i></div>
                <div className="topMovie_score">
                    <span className="topMovie_score-result">{ this.state.scoreDisplay.result }</span>
                    <span className="topMovie_score-text">{ this.state.scoreDisplay.text }</span>
                </div>
                <ul className="topMovie_pagination">
                    { pagination }
                </ul>
                { movieDetailsDom }
            </section>
        );
    }

    screenTransition (direction, fromScreen, toScreen) {
        if (this.isTransitioning) {
            return false;
        } else {
            this.isTransitioning = true;
        }

        var tl = new TimelineMax();
        tl.to("#fullPageWrapper", 0.5, { y: `+=${ direction * storeState.state.windowSize.height }` });
        tl.call(() => {
            this.isTransitioning = false;
            storeState.events.trigger("transitionScreen", { fromScreen, toScreen });
        });
    }

    onCountUpdate (event, data) {
        if (data.movieWatched) {
            this.el.querySelector(`.topMovie_pagination-${ data.moviePosition }`).classList.add("has--watched");
        } else {
            this.el.querySelector(`.topMovie_pagination-${ data.moviePosition }`).classList.remove("has--watched");
        }

        this.setState({
            scoreDisplay: this.getScoreDisplay()
        });
    }

    onPageChange (direction, event) {
        if (!this.eventsEnabled || this.isTransitioning) {
            return false;
        }

        let newItemIndex = this.currentIndex;
        if (direction === "prev" && newItemIndex > 0) {
            newItemIndex--;
        } else if (direction === "next" && newItemIndex < (this.totalItems - 1)) {
            newItemIndex++;
        }

        newItemIndex = clamp(newItemIndex, 0, (this.totalItems - 1));

        if (newItemIndex !== this.currentIndex) {
            this.itemTransition(newItemIndex);
        }
    }

    updatePage () {
        if (this.currentIndex > 0) {
            this.el.querySelector(".topMovie_nav-prev").classList.add("is--visible");
        } else {
            this.el.querySelector(".topMovie_nav-prev").classList.remove("is--visible");
        }

        if (this.currentIndex < (this.totalItems - 1)) {
            this.el.querySelector(".topMovie_nav-next").classList.add("is--visible");
        } else {
            this.el.querySelector(".topMovie_nav-next").classList.remove("is--visible");
        }

        this.el.querySelector(`.topMovie_pagination-${ this.currentIndex + 1 }`).classList.add("is--active");
    }

    itemTransition (itemIndex) {
        if (this.isTransitioning) {
            return false;
        } else {
            this.isTransitioning = true;
            this.eventsEnabled   = false;
        } 

        each(this.el.querySelectorAll(".topMovie_pagination-element"), (item) => {
            item.classList.remove("is--active");
        });

        if (itemIndex !== (this.totalItems - 1)) {
            this.el.querySelector(".topMovie_score").classList.remove("is--visible");
        }

        this.refs["item_" + itemIndex].transitionIn();

        var tl = new TimelineMax();
        tl.to(".topMovie_listWrapper", 0.5, { x: -1 * itemIndex * storeState.state.windowSize.width });
        tl.call(() => {
            this.isTransitioning = false;
            this.eventsEnabled   = true;
            this.currentIndex    = itemIndex;
            this.updatePage();

            if (this.currentIndex === (this.totalItems - 1)) {
                if (!this.endReached) {
                    this.endReached = true;

                    this.el.querySelector(".topMovie_pagination").classList.add("is--visible");
                }

                this.el.querySelector(".topMovie_score").classList.add("is--visible");
            }
        });
    }

    getScoreDisplay () {
        let score = storeState.state.movieWatched;
        let texts = ["Au rattrapage !", "Pas mal", "Bien joué !", "Impressionant !"];
        let text;

        if (score <= this.totalItems * 0.4)                                       { text = texts[0]; }
        else if (score > this.totalItems * 0.4 && score <= this.totalItems * 0.7) { text = texts[1]; }
        else if (score > this.totalItems * 0.7 && score < this.totalItems)        { text = texts[2]; }
        else                                                                      { text = texts[3]; }

        return {
            result: `${ storeState.state.movieWatched + (storeState.state.movieWatched === 1 ? " film vu" : " films vus") } sur ${ this.totalItems }`,
            text
        };
    }

    openDetails (event, data) {
        if (this.isViewingDetails) {
            return false;
        }

        let movieDetails = data.itemInfo;

        storeState.utils.getInfo("movie", movieDetails.id).then((info) => {
            extend(movieDetails, info);

            this.isViewingDetails = true;
            this.setState({ movieDetails });
            document.querySelector(".header-logo").classList.add("is--hidden");

            // Delai maj DOM pour transition CSS
            setTimeout(() => {
                this.detailsOverlay.classList.add("is--visible");
                this.toggleInfoTrigger.classList.add("is--active");

                setTimeout(() => {
                    this.el.querySelector(".topMovie_details-content").classList.add("is--visible");
                }, 400);
            }, 400);
        });
    }

    closeDetails () {
        if (!this.isViewingDetails) {
            return false;
        }

        this.detailsOverlay.classList.remove("is--visible");

        // On attend la fin de la transition CSS
        setTimeout(() => {
            this.isViewingDetails = false;
            this.setState({ movieDetails: {} });
            document.querySelector(".header-logo").classList.remove("is--hidden");
        }, 400);
    }

    toggleInfo () {
        if (this.toggleInfoTrigger.classList.contains("is--active")) {
            this.toggleInfoTrigger.classList.remove("is--active");
            this.el.querySelector(".topMovie_details-content").classList.remove("is--visible");
        } else {
            this.toggleInfoTrigger.classList.add("is--active");
            this.el.querySelector(".topMovie_details-content").classList.add("is--visible");
        }
    }
}

export default ScreenTopMovie;
