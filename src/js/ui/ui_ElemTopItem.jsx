// Librairies
import React, { Component }     from "react";
import { TimelineMax,TweenMax } from "gsap";
import { capitalize }           from "lodash";
require("../libs/vibrant/vibrant");

// Modules
import store from "../modules/store";

const Vibrant    = window.Vibrant;
const storeState = store.getState();

class ElemTopItem extends Component {
    constructor (props) {
        super(props);

        this.info       = props.info
        this.type       = this.info.type;
        this.id         = this.info.id;
        this.position   = props.position;
        this.domPrefix  = `top${ capitalize(this.type) }_item`;
        this.hasWatched = false;
        this.mainColor;
    }

    componentDidMount () {
        let posterImage   = new Image();
        let posterBlob    = new Image();
        let backdropImage = new Image();
        let vibrant;
        let swatches;
        
        TweenMax.set(this.el, { opacity: 0 });

        // On crée un blob pour ne pas importer d'images CORS dans le canvas
        fetch(this.info.poster).then((response) => response.blob()).then((imageData) => {
            posterImage.src    = URL.createObjectURL(imageData);
            posterImage.onload = () => {
                vibrant        = new Vibrant(posterImage);
                swatches       = vibrant.swatches();
                this.mainColor = `hsl(${ swatches.DarkMuted.hsl[0] * 360 }, 40%, 5%)`;

                this.el.querySelector(`.${ this.domPrefix }-background`).style.backgroundColor = this.mainColor;

                backdropImage.src    = this.info.backdrop;
                backdropImage.onload = () => {
                    TweenMax.to(this.el, 0.5, { opacity: 1, clearProps: "opacity" });
                };
            };
        });

        this.checkboxTrigger.addEventListener("click", this.checkWatched.bind(this));
        this.checkboxTrigger.addEventListener("touchend", this.checkWatched.bind(this));

        this.detailsTrigger.addEventListener("click", this.viewDetails.bind(this));
        this.detailsTrigger.addEventListener("touchend", this.viewDetails.bind(this));
    }

    render () {
        let topName         = "Top " + (this.type === "movie" ? "Films" : "Séries");
        let position        = (this.position + 1) < 10 ? "0" + (this.position + 1) : (this.position + 1)
        let hasWatchedLabel = "Je l'ai vu" + (this.type === "tv" ? "e" : "");

        return (
            <div className={ this.domPrefix } ref={ (ref) => this.el = ref } style={{ backgroundImage: `url('${ this.info.backdrop }')` }}>
                <div className={ `${ this.domPrefix }-background` }></div>
                <div className={ `${ this.domPrefix }-content` }>
                    <div className={ `${ this.domPrefix }-content-label` } ref={ (ref) => this.label = ref }>
                        <span className={ `${ this.domPrefix }-content-label-topName` }>{ topName }</span>
                        <span className={ `${ this.domPrefix }-content-label-position` }>{ position }</span>
                    </div>
                    <img className={ `${ this.domPrefix }-content-poster` } src={ this.info.poster } ref={ (ref) => this.poster = ref } />
                    <div className={ `${ this.domPrefix }-content-title` } ref={ (ref) => this.title = ref }>{ this.info.title }</div>
                    <ul className={ `${ this.domPrefix }-content-options` } ref={ (ref) => this.options = ref }>
                        <li className={ `${ this.domPrefix }-content-options-element ${ this.domPrefix }-content-options-hasWatched` } ref={ (ref) => this.checkboxTrigger = ref }>
                            <span className={ `${ this.domPrefix }-content-options-hasWatched-checkbox` } ref={ (ref) => this.checkbox = ref }>
                                <i className="fa fa-check"></i>
                            </span>
                            <span className={ `${ this.domPrefix }-content-options-hasWatched-label` }>{ hasWatchedLabel }</span>
                        </li>
                        <li className={ `${ this.domPrefix }-content-options-element ${ this.domPrefix }-content-options-details` } ref={ (ref) => this.detailsTrigger = ref }>
                            Voir la fiche
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    checkWatched () {
        this.hasWatched = !this.hasWatched;

        if (this.hasWatched) {
            this.checkbox.classList.add("is--checked");
        } else {
            this.checkbox.classList.remove("is--checked");
        }   

        store.dispatch({ type: "updateMovieWatchedCount", data: { state: this.hasWatched } });
        storeState.events.trigger("updateMovieWatchedCount", { count: storeState.state.movieWatched, moviePosition: (this.position + 1), movieWatched: this.hasWatched });
    }

    viewDetails () {
        storeState.events.trigger("viewDetails", { itemInfo: this.info });
    }

    transitionIn () {
        let tl = new TimelineMax();
        tl.from(this.poster, 0.4, { opacity: 0, y:"+=20", clearProps: "all" }, 0.5);
        tl.from(this.title, 0.4, { opacity: 0, y:"+=20", clearProps: "all" }, "-=0.2");
        tl.from(this.options, 0.4, { opacity: 0, y:"-=20", clearProps: "all" }, "-=0.2");
        tl.from(this.label, 0.4, { opacity: 0, x:"-=20", clearProps: "all" }, "-=0.2");
    }
}

export default ElemTopItem;
