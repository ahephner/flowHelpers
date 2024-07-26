import { LightningElement, api, track } from 'lwc';

export default class CompareLists extends LightningElement {
    listOne;
    listTwo;
    term;
    @track comparisonResult;

    @api
    get inputValueOne() {
        return this.listOne || [];
    }
    set inputValueOne(data) {
        this.listOne = data;
        //this.compareListsInOne();
    }

    @api
    get inputValueTwo() {
        return this.listTwo || [];
    }
    set inputValueTwo(data) {
        this.listTwo = data;
        //this.compareListsInOne();
    }

    @api
    get colName() {
        return this.term || '';
    }
    set colName(data) {
        this.term = data;
       // this.compareListsInOne();
    }
    connectedCallback(){
        this.compareListsInOne(); 
    }
    compareListsInOne() {
        
        // exit if any required data is missing
        console.log('i ran');
        if (!this.listOne || !this.listTwo || !this.term) {
            return;
        }

        //const setInTwo = new Set(this.listTwo.map(item => item[this.term]));

        this.comparisonResult = {
            uniqueInOne: 'hold', //this.listOne.filter(item => !setInTwo.has(item[this.term])),
            uniqueInTwo: 'my',//this.listTwo.filter(item => !this.listOne.some(oneItem => oneItem[this.term] === item[this.term])),
            common: 'beer'//this.listOne.filter(item => setInTwo.has(item[this.term]))
        };
        
        //console.log('Comparison Result:', this.comparisonResult);
    }
}