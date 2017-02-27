// Librairies
import React, { Component } from "react";

// Images
import logo from "../../assets/img/logo.svg";

class ElemHeader extends Component {
    componentDidMount () {
        this.el.querySelector(".header-logo").style.opacity = 0;
    }

    render () {
        return (
            <header id="header" ref={ (ref) => this.el = ref }>
                <img className="header-logo" src={logo} alt="Logo" />
            </header>
        );
    }
}

export default ElemHeader;
