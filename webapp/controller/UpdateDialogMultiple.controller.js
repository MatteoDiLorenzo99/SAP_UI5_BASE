sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Text",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, Text, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("project1.controller.UpdateDialogMultiple", {

        setSelectedItems: function (aItems) {
            this._aSelectedItems = aItems;
        },

        getSelectedItems() {
            return this._aSelectedItems;
        },

        setContexts: function (aContexts) {
            this._aContexts = aContexts;
        },

        setDialog: function(oDialog) {
            this._oDialog = oDialog;
        },

        getDialog: function() {
            return this._oDialog;
        },

        onCancel: function () {
            this._oDialog.close();
        },

        onConfirm: function () {
            // Esegui la logica di salvataggio
            this._saveChanges();
        },

        _saveChanges: function() {
            var oDialog = this._oDialog;
            var oMultiEditContainer = oDialog.getContent()[0]; // il container del fragment
            var aContexts = this._aContexts;

            oDialog.setBusy(true);

            oMultiEditContainer.getAllUpdatedContexts(true).then(function(aUpdatedContexts) {
                aUpdatedContexts.forEach(function(oUpdated) {
                    var oContext = oUpdated.context;
                    var oData = oUpdated.data;
                    var oOriginal = oContext.getModel().getObject(oContext.getPath());
                    var oDataToUpdate = {};

                    // Recupera i campi del container
                    var aFields = oMultiEditContainer.getFields(); // tutti i Field del MultiEditContainer

                    aFields.forEach(function(oField) {
                        var sPropName = oField.getPropertyName();
                        var bApplyToEmptyOnly = oField.getApplyToEmptyOnly && oField.getApplyToEmptyOnly();

                        // Se non è applyToEmptyOnly, copia sempre
                        // Altrimenti copia solo se il campo originale è vuoto
                        if (!bApplyToEmptyOnly || !oOriginal[sPropName] || (typeof oOriginal[sPropName] === "string" && !oOriginal[sPropName].trim())) {
                            oDataToUpdate[sPropName] = oData[sPropName];
                        }
                    });

                    // Aggiorna solo i campi filtrati
                    oContext.getModel().update(oContext.getPath(), oDataToUpdate);
                });

                MessageToast.show("Dati salvati correttamente!");
                oDialog.setBusy(false);
                oDialog.close();
            }).catch(function() {
                oDialog.setBusy(false);
                MessageBox.error("Errore durante il salvataggio");
            });
        }

    });
});
