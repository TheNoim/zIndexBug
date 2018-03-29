import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
//import AnimatedList from './AnimatedList';
import FullscreenCard from './FullscreenCard';
import {CardTitle, CardContent} from 'react-native-material-cards';

export default class App extends React.Component {

    data = [
        "Test 1",
        "Test 2",
        "Test 3",
        "Test 4",
        "Test 5",
        "Test 6",
        "Test 7",
        "Test 8",
        "Test 9",
    ];

    _render({item = "U"}) {
        let r;
        return (
            <FullscreenCard ref={ref => r = ref}>
                <CardTitle title={item}></CardTitle>
                <CardContent>
                    <Text onPress={() => r.toggle()}>Click to expand</Text>
                </CardContent>
            </FullscreenCard>
        );
    }

    render() {
        return (
            <ScrollView style={styles.list}>
                <Text>Test</Text>
                {/*<AnimatedList style={styles.list} renderItem={this._render.bind(this)} data={this.data} keyExtractor={i => i} inAnimation={'zoomInLeft'} outAnimation={'zoomOutRight'} delay={50} duration={280}>
    </AnimatedList>*/}
                <FlatList style={styles.list} renderItem={this._render.bind(this)} data={this.data} keyExtractor={i => i}></FlatList>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    }
});