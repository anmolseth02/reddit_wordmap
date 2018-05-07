import React, {Component} from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';
import createBrowserHistory from 'history/createBrowserHistory';
import styles from './main.css';
import { computed, action, extendObservable } from 'mobx';
import {inject, observer} from 'mobx-react';
import _ from 'lodash';
import 'whatwg-fetch';

class Sub {
    constructor(name) {
        extendObservable(this, {
            name,
            isChecked: true,
            updateCheck: action('update check', isChecked => this.isChecked = isChecked),
        });
    }
}

class RedditStore {
    constructor() {
        extendObservable(this, {
            URL: 'https://www.reddit.com/r/news/comments/85osel/deletefacebook_movement_gains_steam_after_50/',
            subs: [],
            isLoading: false,
            wordmap: '',
            setURL: action('set url', URL => this.URL = URL),
            getSubs: action('get subreddits', () => {
                this.isLoading = true;
                return fetch(`http://localhost:5000/api/subs?link=${encodeURIComponent(this.URL)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }).then(response => response.json())
                    .then(subs => {
                        if (subs.length) {
                            this.subs = _.map(subs, sub => new Sub(sub));
                            this.getWordmap();
                        }
                        this.isLoading = false;
                    });
            }),
            getWordmap: action('get wordmap', () => {
                this.isLoading = true;
                let subStrings = _.reduce(this.subs, (string, sub) => `${string},${sub.name}`, '')

                return fetch(`http://localhost:5000/api/wordmap?link=${encodeURIComponent(this.URL)}&subs=${encodeURIComponent(subStrings)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }).then(response => response.json())
                    .then(({img}) => {
                        this.wordmap = img;
                        this.isLoading = false;
                    });
            }),
        });
    }
}

let redditStore = new RedditStore();

let stores = {redditStore};

const Input = ({redditStore}) => <input
    placeholder = "Reddit article link"
    value = {redditStore.URL}
    className = {styles.input}
    onChange = {e => redditStore.setURL(e.target.value)}
/>;

export const InputView = inject('redditStore')(observer(Input));

const Subs = ({redditStore}) => <div>
    {   
        _.get(redditStore, 'subs.length') ?
            _.map(redditStore.subs, (sub, index) => <div key = {index}>
                    <input
                        type = 'checkbox'
                        checked = {sub.isChecked}
                        className = {styles.checkbox}
                        onChange = {e => sub.updateCheck(e.target.checked)}
                    /> {sub.name}
            </div>) :
            false
    } 
</div>;

export const SubsView = inject('redditStore')(observer(Subs));

const Button = ({redditStore}) => <div className = {styles.button} onClick = {redditStore.getSubs}>
    Search
</div>;

export const ButtonView = inject('redditStore')(observer(Button));

const Wordmap = ({redditStore}) => <div className = {styles.wordmap}>
    <img src = {redditStore.wordmap} />
</div>;

export const WordmapView = inject('redditStore')(observer(Wordmap));


const Main = props => <Provider {...stores}>
    <div style = {{display: 'flex', justifyContent: 'spaceAround', alignItems: 'center', flexDirection: 'column'}}>
        <InputView />
        <ButtonView />
        <div className = {styles.infoContainer}>
            <SubsView />
            <WordmapView />
            
        </div>
    </div>
</Provider>;

render((<Main />), document.getElementById('app'));
