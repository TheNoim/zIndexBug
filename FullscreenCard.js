import React, { Component } from "react";
import { View, StyleSheet, UIManager, LayoutAnimation } from "react-native";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import PropType from "prop-types";
import Card from "./CardMod";
import * as Animatable from "react-native-animatable-promise";
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

@observer
class FullscreenCard extends Component {
    static propTypes = {
        children: PropType.any,
        style: PropType.any
    };

    @observable fullscreen = false;

	@action
    open() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.fullscreen = true;
    }

	@action
    close() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.fullscreen = false;
    }

    toggle() {
        if (this.fullscreen) {
            return this.close();
        } else {
            return this.open();
        }
    }

    render() {
        return (
            <Card style={this.fullscreen ? styles.open : styles.normal} {...this.props}>
                {this.props.children}
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    normal: {},
    open: {
        width: responsiveWidth(100),
        height: responsiveHeight(100),
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 999999999999999999999999,
        elevation: 10000,
        margin: 0,
        position: "absolute"
    }
});

export default FullscreenCard;
