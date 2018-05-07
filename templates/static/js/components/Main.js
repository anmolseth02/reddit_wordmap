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
    constructor({name, link}) {
        extendObservable(this, {
            name,
            link,
            isChecked: true,
            updateCheck: action('update check', isChecked => this.isChecked = isChecked),
        });
    }
}

class RedditStore {
    constructor() {
        extendObservable(this, {
            URL: '',
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
                        }
                        this.isLoading = false;
                    });
            }),
            getWordmap: action('get wordmap', () => {
                this.isLoading = true;
                let subStrings = _.reduce(this.subs, (string, sub) => sub.isChecked ? `${string}${sub.name},` : string, '');
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
                    />
                    <a href = {sub.link} target="_blank" ><span>{sub.name}</span></a>
            </div>) :
            false
    } 
</div>;

export const SubsView = inject('redditStore')(observer(Subs));

const SearchButton = ({redditStore}) => <div className = {styles.button} onClick = {redditStore.getSubs}>
    Search
</div>;

export const SearchButtonView = inject('redditStore')(observer(SearchButton));

const MapButton = ({redditStore}) => <div className = {styles.button} onClick = {redditStore.getWordmap}>
    Map
</div>;

export const MapButtonView = inject('redditStore')(observer(MapButton));

const Wordmap = ({redditStore}) => <div className = {styles.wordmap}>
    <img src = {redditStore.wordmap} />
</div>;

export const WordmapView = inject('redditStore')(observer(Wordmap));


const Main = props => <Provider {...stores}>
    <div style = {{display: 'flex', justifyContent: 'spaceAround', alignItems: 'center', flexDirection: 'column'}}>
        <div>
            <InputView />
            <SearchButtonView />
            <MapButtonView />
        </div>
        <div className = {styles.infoContainer}>
            <SubsView />
            <WordmapView />
        </div>
    </div>
</Provider>;

render((<Main />), document.getElementById('app'));
