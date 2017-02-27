// Librairies
import React, { Component }      from "react";
import { TimelineMax, TweenMax } from "gsap";
import { capitalize }            from "lodash";

// Composants UI
import ElemPatchworkBG  from "./ui_ElemPatchworkBG";

// Modules
import store from "../modules/store";

const storeState = store.getState();

class ScreenHome extends Component {
    constructor (props) {
        super(props);

        this.eventsEnabled   = false;
        this.isTransitioning = false;
    }

    componentDidMount () {
        // Ajout de la detection de mouvement vers un autre ecran
        storeState.utils.detectScreenChange(this.el, "next", this.screenTransition.bind(this, -1, "home", `top${ capitalize(storeState.state.activeTop) }`), this);

        let tl = new TimelineMax();
        tl.from(this.el.querySelector(".home_headingWrapper h1"), 0.8, { opacity:0, y:"-=20", clearProps:"all" });
        tl.from(this.el.querySelector(".home_headingWrapper h2"), 0.8, { opacity:0, y:"+=20", clearProps:"all" }, "-=0.4");
        tl.to(document.querySelector(".header-logo"), 0.8, { opacity:1, clearProps:"all" });
        tl.from(this.el.querySelector(".home_mouse"), 0.8, { opacity:0, clearProps:"all" });

        storeState.events.on("resize", (event, data) => {
            if (this.eventsEnabled) {
                TweenMax.set("#fullPageWrapper", { y: 0 });
            }
        });
    }

    render () {
        return (
            <section id="screen_home" className="screen" ref={ (ref) => this.el = ref }>
                <ElemPatchworkBG />
                <div className="home_headingWrapper">
                    <h1>Les <span>incontournables</span><br />de <span>2016</span></h1>
                    <h2>L’heure du bilan a sonn&eacute; : voici le top 10 des films les plus populaires<br />
                    en vid&eacute;o à la demande cette année. Les avez-vous tous vus ?</h2>
                </div>
                <div className="home_mouse"></div>
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
        tl.to("#fullPageWrapper", 0.5, { y: direction * storeState.state.windowSize.height });
        tl.call(() => {
            this.isTransitioning = false;
            storeState.events.trigger("transitionScreen", { fromScreen, toScreen });
        });
    }
}

export default ScreenHome;
