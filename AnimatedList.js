import React, {Component} from 'react';
import PropType from 'prop-types';
import * as Animatable from 'react-native-animatable-promise';
import {LayoutAnimation, UIManager} from 'react-native';
import {observable, action, runInAction} from "mobx"
import {observer} from 'mobx-react';
import TransitionGroup from 'react-native-transitiongroup';
import arrayDiff from 'arraydiff';
import deepEqual from 'deep-equal';

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

@observer
class AnimatedListItem extends Component {

	cConfig = Object.assign( Object.create( Object.getPrototypeOf(LayoutAnimation.Presets.easeInEaseOut)), LayoutAnimation.Presets.easeInEaseOut);

	static propTypes = {
		animationOut: PropType.string.isRequired,
		animationIn: PropType.string.isRequired,
		duration: PropType.number.isRequired
	};

	locked = false;

	@observable ItemViewStyle = {};

	componentWillEnter(callback) {
		this.refs.Item[this.props.animationIn](this.props.duration).then(callback);
	}

	constructor(props) {
		super(props);
		this.cConfig.duration = this.props.duration / 2;
	}

	componentWillLeave(callback) {
		this.locked = true;
		this.refs.Item.stopAnimation();
		this.refs.Item.transition({opacity: 1, scale: 1}, {opacity: 0, scale: 0}, this.props.duration, 'ease').then(() => {
			if (callback && typeof callback === 'function') callback()
		}).catch(e => console.error('dddddd', e));

		setTimeout(() => {
			LayoutAnimation.configureNext(this.cConfig);
			runInAction(() => this.ItemViewStyle = {height: 0});
		}, this.props.duration / 2)
	}

	render() {
		return (<Animatable.View ref='Item' useNativeDriver style={this.ItemViewStyle}>
			{this.props.children}
		</Animatable.View>);
	}

}

@observer
class AnimatedList extends Component {

	static propTypes = {
		data: PropType.any.isRequired,
		renderItem: PropType.func.isRequired,
		keyExtractor: PropType.func.isRequired,
		inAnimation: PropType.string.isRequired,
		outAnimation: PropType.string.isRequired,
		style: PropType.any,
		duration: PropType.number,
		delay: PropType.number
	};

	@observable keyExtractor = this.props.keyExtractor;
	@observable data = [];
	@observable duration = this.props.duration || 1000;
	@observable outAnimation = this.props.outAnimation;
	@observable inAnimation = this.props.inAnimation;
	@observable shouldUpdate = 0;

	_renderItem = this.props.renderItem;
	delay = this.props.delay || 100;

	queue;
	actionIsRunning = false;

	componentDidMount() {
		this.setProps(this.props);
	}

	componentWillReceiveProps(props) {
		this.setProps(props);
	}

	setProps(props) {
		requestAnimationFrame(() => {
			if (this.actionIsRunning) {
				this.queue = props;
				return;
			}
			this.queue = null;
			this.actionIsRunning = true;
			runInAction(() => {
				this.duration = props.duration || 1000;
				this.outAnimation = props.outAnimation;
				this.inAnimation = props.inAnimation;
				this.delay = props.delay;
				this.keyExtractor = props.keyExtractor;
			});
			const differences = arrayDiff(typeof this.data.toJS === 'function' ? this.data.toJS() : this.data, typeof props.data.toJS === 'function' ? props.data.toJS() : props.data, (a, b) => {
				return deepEqual(a, b);
			});
			this.applyDifferences(differences).then(() => {
				this.actionIsRunning = false;
				if (this.queue) this.setProps.bind(this)(this.queue);
			}).catch(e => console.error(e));
		});
	}

	async applyDifferences(differences) {
		for (let diff of differences) {
			if (!diff.type) continue;
			await new Promise((resolve) => requestAnimationFrame(resolve));
			if (diff.type === 'remove' && diff.index !== undefined && diff.howMany !== undefined) {
				runInAction(() => {
					this.data.splice(diff.index, diff.howMany);
					this.shouldUpdate++;
				});
			}
			if (diff.type === 'move' && diff.from !== undefined && diff.to !== undefined) {
				runInAction(() => {
					moveInThisArray(this.data, diff.from, diff.to);
					this.shouldUpdate++;
				});
			}
			if (diff.type === 'insert' && diff.index !== undefined && Array.isArray(diff.values)) {
				const argArray = [diff.index, 0];
				for (let value of diff.values) {
					argArray.push(value);
				}
				runInAction(() => {
					this.data.splice.apply(this.data, argArray);
					this.shouldUpdate++;
				});
			}
			await new Promise((resolve) => setTimeout(resolve, this.delay));
		}
		await new Promise((resolve) => setTimeout(resolve, this.duration));
	}


	async addItems(newItems) {
		for (let i = 0; i < newItems.length; i++) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
			runInAction(() => {
				this.data.push(newItems[i]);
			});
			await new Promise((resolve) => {
				setTimeout(resolve, this.delay);
			});
		}
	}

	async removeItems() {
		for (let i = this.data.length; i > 0; i--) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
			runInAction(() => {
				this.data.pop();
			});
			await new Promise((resolve) => {
				setTimeout(resolve, this.delay);
			});
		}
	}

	/**
	 * @typedef {Object} FlatListRenderInfo
	 * @property {Object} item
	 * @property {Number} index
	 * @property {Object} separators
	 */

	/**qq
	 *
	 * @param {FlatListRenderInfo} info
	 */
	renderItem(info) {
		return (
			<AnimatedListItem animationOut={this.outAnimation} animationIn={this.inAnimation} duration={this.duration}
			                  key={this.keyExtractor(info.item)} useNativeDriver>
				{this._renderItem(info)}
			</AnimatedListItem>);
	}

	render() {
		return (<TransitionGroup>
			{this.data.map((item, index) => {
				return this.renderItem({
					item: item,
					index: index,
					separators: {}
				});
			})}
		</TransitionGroup>)
	}

}

function moveInThisArray(arr, old_index, new_Index) {
	if (new_Index >= arr.length) {
		let k = new_Index - arr.length;
		while ((k--) + 1) {
			arr.push(undefined);
		}
	}
	arr.splice(new_Index, 0, arr.splice(old_index, 1)[0]);
	return arr;
}

export default AnimatedList;