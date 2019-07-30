/*global location */
sap.ui.define([
	"itsgrp/com/br/OrdemSemiAcabado/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"itsgrp/com/br/OrdemSemiAcabado/model/formatter"
], function(BaseController, JSONModel, MessageBox, formatter) {
	"use strict";
	return BaseController.extend("itsgrp.com.br.OrdemSemiAcabado.controller.Detail", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");
			sap.m.URLHelper.triggerEmail(null, oViewModel.getProperty("/shareSendEmailSubject"), oViewModel.getProperty(
				"/shareSendEmailMessage"));
		},
		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function(oEvent) {
			var sTitle, iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");
			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var sObjectId1 = oEvent.getParameter("arguments").objectId1;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("ZC_ORDENS", {
					aufnr: sObjectId,
					posnr: sObjectId1
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");
			var oView = this.getView();
			oView.byId("iptPeso").setValue("");
			oView.byId("idOperador").setValue("");
			oView.byId("iptLote").setValue("");
			var mdl = this.getView().byId("lineItemsList").getModel();
			this.getView().byId("lineItemsList").getModel().refresh(true);
			this.getView().byId("lineItemsList").setModel(mdl);
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.aufnr,
				sObjectName = oObject.aufnr,
				oViewModel = this.getModel("detailView");
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView"),
				oLineItemTable = this.byId("lineItemsList"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);
			oLineItemTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		onPeso: function() {

			this.getView().byId("__button0").setBusy(true);
			var vPortaLogica;
			var vPeso;
			var oModelPorta = this.getView().getModel("Porta");
			var oModelPeso = this.getView().getModel("Peso");
			var sPath = "/ZC_PORTALOGICA";
			var oView = this.getView();
			var error = false;
			oModelPorta.read(sPath, {
				success: function(response) {
					vPortaLogica = response.results[0].porta_logica;
					var sPath1 = "/GetPesoSet('" + vPortaLogica + "')";
					oModelPeso.read(sPath1, {
						success: function(response1) {
							vPeso = response1.peso;
							oView.byId("iptPeso").setValue(vPeso);
							oView.byId("__button0").setBusy(false);

							var sPath2 = oView.byId("__list0").getBindingContext().getPath();
							var oModelView = oView.getModel().getProperty(sPath2);

							//calcula diferença de 1%
							var percentValue = (oModelView.PesoSac * 1) / 100;
							var PesoINI = oModelView.PesoSac - percentValue;
							var PesoFIN = (+oModelView.PesoSac) + (+percentValue);
							PesoINI = PesoINI.toFixed(3);
							PesoFIN = PesoFIN.toFixed(3);
							//to do comentar essa bagaça 
							oView.byId("__action0").setEnabled(true);

							var operador = oView.byId('idOperador').getValue();
							if (operador === '') {
								error = true;
							}

							var oTable = oView.byId('lineItemsList').getItems();
							this.getView().byId("__button0").setBusy(true);
							for (var i = 0; i < oTable.length; i++) {
								var cell = oTable[i].getCells();
								var lote = cell[2].getValue();
								var enabled = cell[2].getEnabled();
								if (enabled === true && lote !== '') {
									cell[2].setEnabled(false);
								} else {
									error = true;
								}
							}
							if (error === true) {
								MessageBox.information(
									'Preencher Campos Manuais'
								);
							} else {
								if (PesoINI <= vPeso && PesoFIN >= vPeso) {
									oView.byId("__action0").setEnabled(true);
								}
							}
						}
					});
				}
			});
		},
		checkFields: function() {},
		/**
		 *@memberOf itsgrp.com.br.OrdemSemiAcabado.controller.Detail
		 */
		ApontaProd: function(oEvent) {
			var error = false;
			var strItems = '';
			var matnr;
			var lote;
			var ordem;
			var oView = this.getView();
			var operador = oView.byId('idOperador').getValue();
			if (operador === '') {
				error = true;
			}
			var peso = oView.byId('iptPeso').getValue();
			if (peso === '') {
				error = true;
			}
			var oTable = this.byId('lineItemsList').getItems();
			this.getView().byId("__button0").setBusy(true);
			for (var i = 0; i < oTable.length; i++) {
				var cell = oTable[i].getCells();
				matnr = cell[0].getText();
				lote = cell[2].getValue();
				var enabled = cell[2].getEnabled();
				if (enabled === true && lote === '') {
					error = true;
					break;
				}
				ordem = cell[3].getText();
				if (lote !== '') {
					strItems = strItems + matnr.substring(0, 10) + '-' + lote + '&';
				}
			}

			if (error === true) {
				MessageBox.information(
					'Preencher Campos Manuais'
				);
			} else {
				var oModelPeso = this.getView().getModel("Peso");
				var sPath = "/ApontarSet(ordem='" + ordem + "',operador='" + operador + "',peso='" + peso + "',items='" + strItems + "')";
				oModelPeso.read(sPath, {
					success: function(response) {
						oView.byId("__button0").setBusy(false);
						MessageBox.information(
							response.message
						);

					}
				});
			}
		}
	});
});