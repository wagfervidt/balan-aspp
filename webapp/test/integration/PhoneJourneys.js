/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/NavigationJourneyPhone",
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/NotFoundJourneyPhone",
		"itsgrp/com/br/OrdemSemiAcabado/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});