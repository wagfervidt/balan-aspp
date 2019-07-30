/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 ZC_ORDENS in the list
// * All 3 ZC_ORDENS have at least one to_Itens

sap.ui.require([
	"sap/ui/test/Opa5",
	"itsgrp/com/br/OrdemSemiAcabado/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"itsgrp/com/br/OrdemSemiAcabado/test/integration/pages/App",
	"itsgrp/com/br/OrdemSemiAcabado/test/integration/pages/Browser",
	"itsgrp/com/br/OrdemSemiAcabado/test/integration/pages/Master",
	"itsgrp/com/br/OrdemSemiAcabado/test/integration/pages/Detail",
	"itsgrp/com/br/OrdemSemiAcabado/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "itsgrp.com.br.OrdemSemiAcabado.view."
	});

	sap.ui.require([
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/MasterJourney",
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/NavigationJourney",
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/NotFoundJourney",
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});