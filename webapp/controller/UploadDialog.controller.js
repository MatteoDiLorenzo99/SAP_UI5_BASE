sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.UploadDialog", {

        setDialog: function (oDialog) {
            this._oDialog = oDialog;
        },

        setModel: function(oModel) {
            this._oModel = oModel;
        },

        getModel: function() {
            return this._oModel;
        },

        setRouter: function(oRouter) {
            this._oRouter = oRouter;
        },

        getRouter: function() {
            return this._oRouter;
        },

        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        },

        onFileChange: async function (oEvent) {
            var oFile = oEvent.getParameter("files")[0];
            if (!oFile) {
                return;
            }

            try {
                await this._loadXLSX();
                this._readXLSX(oFile);
            } catch (e) {
                MessageToast.show("Errore caricamento XLSX");
                console.error(e);
            }
        },

        _loadXLSX: function () {
            if (window.XLSX) {
                return Promise.resolve();
            }

            return new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

                script.onload = function () {
                    setTimeout(function () {
                        if (window.XLSX) resolve();
                        else reject("XLSX non disponibile");
                    }, 100);
                };

                script.onerror = function () {
                    reject("Errore caricamento XLSX");
                };

                document.head.appendChild(script);
            });
        },

_readXLSX: function(oFile) {
    if (!oFile) return;

    var reader = new FileReader();
    var that = this;

    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: "array" });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];

            // Convert sheet to JSON
            var json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            
            // Map fields if needed (example: NumeroTreno, StazionePartenza, etc.)
            var mappedData = json.map(function(row) {
                return {
                    NumeroTreno: row["NumeroTreno"] || "",
                    StazionePartenza: row["StazionePartenza"] || "",
                    StazioneArrivo: row["StazioneArrivo"] || ""
                };
            });
            console.log(mappedData);
            // ✅ Create JSON model and attach to core (so the view can see it)
            var oPreviewModel = new sap.ui.model.json.JSONModel({ items: mappedData });
            console.log("opreviewmode", oPreviewModel);
            sap.ui.getCore().setModel(oPreviewModel, "preview");

            // Close the upload dialog if exists
            if (that._oDialog) {
                that._oDialog.close();
            }

            // Navigate to preview page
            var oRouter = that.getRouter();
            if (oRouter) {
                oRouter.navTo("RouteFileUploaded"); // Use your preview route name
            }

            sap.m.MessageToast.show("File Excel caricato correttamente");

        } catch (err) {
            sap.m.MessageToast.show("Errore durante la lettura del file.");
            console.error(err);
        }
    };

    reader.onerror = function() {
        sap.m.MessageToast.show("Errore durante la lettura del file.");
    };

    reader.readAsArrayBuffer(oFile);
}

    });
});
