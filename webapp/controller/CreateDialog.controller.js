sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("project1.controller.CreateDialog", {
        setDialog: function (oDialog) {
            this._oDialog = oDialog;
        },
        onCancel: function () {
            this._oDialog.close();
        },
        onConfirm: function () {
            const oModel = this.ottieniModel();

            // Usa il riferimento al dialog che hai già salvato
            const oNumeroTrenoField = this._oDialog.getContent()[0]
                .getGroups()[0]
                .getGroupElements()[0]
                .getFields()[0];
            
            const oStazionePartenzaField = this._oDialog.getContent()[0]
                .getGroups()[0]
                .getGroupElements()[1]
                .getFields()[0];
            
            const oStazioneArrivoField = this._oDialog.getContent()[0]
                .getGroups()[0]
                .getGroupElements()[2]
                .getFields()[0];

            const sNumeroTreno = oNumeroTrenoField.getValue();
            const sStazionePartenza = oStazionePartenzaField.getValue();
            const sStazioneArrivo = oStazioneArrivoField.getValue();

            if(!sNumeroTreno){
                    sap.m.MessageBox.error("Il campo chiave Numero Treno è mancante");
                    return;
            }

                const oNewEntry = {
                NumeroTreno: sNumeroTreno,
                StazionePartenza: sStazionePartenza,
                StazioneArrivo: sStazioneArrivo
            };
           // console.log(oNewEntry);
                oModel.create("/ZCDS_TRAINS_VIDEO", oNewEntry, {
                success: function(oData) {
                    sap.m.MessageToast.show("Treno creato con successo!");
                //    console.log("Creazione riuscita:", oData);
                    this._oDialog.close();
                    // Refresh della tabella
                    oModel.refresh();
                }.bind(this),
        error: function(oError) {
            let sMessage = "Errore durante la creazione del treno";
            let sDetails = "";
            
            console.error("Errore completo:", oError);
            
            try {
                const oErrorData = JSON.parse(oError.responseText);
                
                // Messaggio principale
                if (oErrorData.error?.message?.value) {
                    sMessage = oErrorData.error.message.value;
                } else if (oErrorData.error?.message) {
                    sMessage = oErrorData.error.message;
                }
                
                // Codice errore
                if (oErrorData.error?.code) {
                    sDetails += "Codice: " + oErrorData.error.code;
                }
                
                // Status HTTP
                if (oError.statusCode) {
                    sDetails += (sDetails ? "\n" : "") + "Status HTTP: " + oError.statusCode;
                }
                
                // Dettagli aggiuntivi
                if (oErrorData.error?.innererror?.errordetails) {
                    const errorMessages = oErrorData.error.innererror.errordetails
                        .map(d => d.message)
                        .filter(m => m)
                        .join("\n");
                    if (errorMessages) {
                        sDetails += (sDetails ? "\n" : "") + errorMessages;
                    }
                }
                
            } catch (e) {
                console.error("Parsing error:", e);
                sDetails = oError.message || oError.statusText || "";
            }
            
            sap.m.MessageBox.error(
                sMessage + (sDetails ? "\n\n" + sDetails : ""),
                {
                    title: "Errore Creazione",
                    details: oError.responseText
                }
            );
        }.bind(this)});
        },
        ottieniModel: function () {
            return this._oDialog.getModel();
        },
        ottieniDialog: function () {
            return this._oDialog;
        }
    });
});


   