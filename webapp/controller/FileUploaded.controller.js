sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.FileUploaded", {

        onInit: function() {
            // Collegati al routing per intercettare quando la view viene mostrata
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteFileUploaded").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function() {
            // Recupera il modello dal Core e assegnalo alla View
            var oPreviewModel = sap.ui.getCore().getModel("preview");
            
            if (oPreviewModel) {
                this.getView().setModel(oPreviewModel, "preview");
                console.log("Modello preview assegnato alla view:", oPreviewModel.getData());
            } else {
                sap.m.MessageToast.show("Nessun dato da visualizzare");
            }
        },

        onNavBack: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView1"); // o la tua route principale
        },

        onConfirmImport: function() {
            // Logica per confermare l'import
            var oModel = this.getView().getModel("preview");
            var aItems = oModel.getProperty("/items");
            console.log("Righe da importare:", aItems);
            
            // Qui implementerai la logica per salvare su backend
            sap.m.MessageToast.show("Import confermato!");
        },

        onDeleteRows: function() {
            var oTable = this.byId("PreviewTable");
            var aSelectedItems = oTable.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                MessageBox.warning("Seleziona almeno una riga da eliminare.");
                return;
            }

            var oModel = this.getView().getModel("preview");
            var aItems = oModel.getProperty("/items");
            
            // ✅ Ottieni gli indici e ordinali in ordine decrescente
            var aIndices = aSelectedItems.map(function(oItem) {
                return oTable.indexOfItem(oItem);
            }).sort(function(a, b) {
                return b - a; // Ordine decrescente
            });
            
            // Rimuovi dal più alto al più basso così gli indici non cambiano
            aIndices.forEach(function(iIndex) {
                aItems.splice(iIndex, 1);
            });
            
            oModel.setProperty("/items", aItems);
            oTable.removeSelections(true); // Deseleziona tutto
            MessageToast.show(aSelectedItems.length + " righe eliminate");
        }
    });
});