// Librairies
import React, { Component }      from "react";
import { TimelineMax, TweenMax } from "gsap";
import {
    sample,
    sampleSize,
    map,
    shuffle,
    each,
    without,
    dropRight
} from "lodash";

// Modules
import store from "../modules/store";

class ElemPatchworkBG extends Component {
    constructor (props) {
        super(props);

        this.posterSize = 240;
        this.cols       = Math.ceil(screen.viewportWidth / this.posterSize);
        this.rows       = Math.ceil(screen.viewportHeight / this.posterSize) + 1;
        this.posterNb   = this.cols * this.rows;

        this.movies     = sampleSize(map(store.getState().state.popular.movie, "id"), this.posterNb);
        this.tv         = sampleSize(map(store.getState().state.popular.tv, "id"), this.posterNb - this.movies.length);
        this.posters    = [];

        each(this.movies, (id) => {
            this.posters.push((store.getState().utils.getPictures("movie", id).poster));
        });

        each(this.tv, (id) => {
            this.posters.push((store.getState().utils.getPictures("tv", id).poster));
        });

        this.posters     = shuffle(this.posters);
        this.posterComps = map(this.posters, (poster, index) =>
            <div className="home_patchworkBG-poster" style={{ opacity: 0, backgroundImage: `url('${ poster }')` }} key={ index }></div>
        );
    }

    componentDidMount () {
        const postersDOM     = dropRight(this.el.querySelectorAll(".home_patchworkBG-poster"), this.cols);
        const createTimeline = (previousPoster) => {
            let activePoster = sample(without(postersDOM, previousPoster));

            let tl = new TimelineMax();
            tl.set(activePoster, { className: "+=is--active" }, 0.6);
            tl.set(activePoster, { className: "-=is--active" }, 1.2);
            tl.call(createTimeline.bind(this, activePoster), [], null, "-=0.6");
        }

        createTimeline.call(this, null);

        each(this.el.querySelectorAll(".home_patchworkBG-poster"), (item, index) => {
            let image    = new Image();
            image.src = this.posters[index];
            image.onload = () => {
                TweenMax.to(item, 0.5, { opacity: 0.1, clearProps: "opacity" });
            };
        });
    }

    render () {
        return (
            <div className="home_patchworkBG" ref={ (ref) => this.el = ref }>
               { this.posterComps }
            </div>
        );
    }
}

export default ElemPatchworkBG;
