import {LightningElement,api} from 'lwc';

export default class CartItemMargins extends LightningElement {
	 @ api
	get cartItemRecords() {
		return this._cartItemRecords;
	}
	set cartItemRecords(records) {
		this._cartItemRecords = records;
		this.setup();
	}

	 @ api
	get productRecords() {
		return this._productRecords;
	}
	set productRecords(records) {
		this._productRecords = records;
		this.setup();
	}

	_productRecords = undefined;
	_cartItemRecords = undefined;
	_marginRecords = [];

	 @ api
	fieldColumns = [{
			label: 'Cart Item Name',
		fieldName: 'cartItemName',
			type: 'text'
		}, {
			label: 'Quantity',
			fieldName: 'qty',
			type: 'number',
			cellAttributes: {
				alignment: 'right'
			}

		},{
			label: 'Floor Price',
			fieldName: 'flrPrice',
			type: 'currency',
			cellAttributes: {
				alignment: 'right'
			},
			typeAttributes: {
				currencyCode: 'USD',
				step: '0.01'
			}

		},{
			label: 'Unit Cost',
			fieldName: 'unitCost',
			type: 'currency',
			cellAttributes: {
				alignment: 'right'
			},
			typeAttributes: {
				currencyCode: 'USD',
				step: '0.01'
			}

		}, {
			label: 'Sales Price',
			fieldName: 'salesPrice',
			type: 'currency',
			cellAttributes: {
				alignment: 'right'
			},
			typeAttributes: {
				currencyCode: 'USD',
				step: '0.01'
			}
		}, {
			label: 'Margin %',
			fieldName: 'marginPerc',
			type: 'percent',
			cellAttributes: {
				alignment: 'right',
				iconName: { fieldName: 'marginIcon' },
				iconPosition: 'right',
				class: { fieldName: 'marginCss' }
			},
			typeAttributes: {
				step: '0.01',
				minimumFractionDigits: '0',
				maximumFractionDigits: '2'
			}
		}
	];

	connectedCallback() {
		this.setup();
	}

	 @ api
	get marginRecords() {
		return this._marginRecords;
	}

	setup() {
		let marginRecord;
		let foundProductRecord;

		this._marginRecords = [];

		if (this._cartItemRecords && this._productRecords) {

			this._cartItemRecords.forEach(cartItemRecord => {

				foundProductRecord = this._productRecords.find((productRecord) => cartItemRecord.Product2Id === productRecord.Id);

				if (foundProductRecord) {
					let agency = foundProductRecord.Agency_Pricing__c ? 'Agency': '';
					let rup = foundProductRecord.RUP__c ? 'RUP': '';
					let mv = foundProductRecord.Manufacturer_Floor__c ? 'MV': '';

					
					const calculatedSalesPrice = cartItemRecord.TotalPriceAfterAllAdjustments / cartItemRecord.Quantity;
					marginRecord = {
						cartItemName: `${cartItemRecord.Name} ${agency} ${rup} ${mv}`,
						salesPrice: calculatedSalesPrice,
						flrPrice: foundProductRecord.Floor_Price__c, 
						qty: cartItemRecord.Quantity,
						unitCost: foundProductRecord.Product_Cost__c,
						marginPerc: 1 - (foundProductRecord.Product_Cost__c / calculatedSalesPrice),
						marginIcon: undefined,
						marginCss: undefined
					};

					marginRecord.marginIcon = (marginRecord.marginPerc > 0) ? 'utility:up' : 'utility:down';
					marginRecord.marginCss = (marginRecord.marginPerc > 0) ? 'slds-text-color_success' : 'slds-text-color_error';

					this._marginRecords.push(marginRecord);
				}
			});
		}
	}
}