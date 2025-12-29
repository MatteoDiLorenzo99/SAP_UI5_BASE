sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("project1.controller.UpdateDialogMultiple", {
        setSelectedItems: function (aSelectedItems) {
            this._aSelectedItems = aSelectedItems;
        },
        
        setDialog: function (oDialog) {
            this._oDialog = oDialog;
        },
        
        onCancel: function () {
            this._oDialog.close();
        },

        onConfirm: function () {
            if (!this._aSelectedItems || this._aSelectedItems.length === 0) {
                sap.m.MessageBox.error("Nessuna riga selezionata");
                return;
            }

            // Leggi i valori dagli SmartField usando il loro ID completo
            const oStazionePartenza = this._oDialog.getContent()[0].getGroups()[0].getGroupElements()[1].getFields()[0];
            const oStazioneArrivo = this._oDialog.getContent()[0].getGroups()[0].getGroupElements()[2].getFields()[0];
            
            if (!oStazionePartenza || !oStazioneArrivo) {
                sap.m.MessageBox.error("Errore nell'accesso ai campi");
                return;
            }

            const sNuovaStazionePartenza = oStazionePartenza.getValue();
            const sNuovaStazioneArrivo = oStazioneArrivo.getValue();

           // console.log("Valori da aggiornare:", { sNuovaStazionePartenza, sNuovaStazioneArrivo });

            // Verifica che almeno un campo sia compilato
            if (!sNuovaStazionePartenza && !sNuovaStazioneArrivo) {
                sap.m.MessageBox.warning("Inserisci almeno un valore da aggiornare");
                return;
            }

            // Ottieni il modello OData dalla prima riga selezionata
            const oModel = this._aSelectedItems[0].getBindingContext().getModel();

            // Itera su tutte le righe selezionate e aggiorna i valori
            this._aSelectedItems.forEach(item => {
                const oContext = item.getBindingContext();
                const sPath = oContext.getPath();

                // Aggiorna solo i campi compilati
                if (sNuovaStazionePartenza) {
                    oModel.setProperty(sPath + "/StazionePartenza", sNuovaStazionePartenza);
                }
                if (sNuovaStazioneArrivo) {
                    oModel.setProperty(sPath + "/StazioneArrivo", sNuovaStazioneArrivo);
                }
            });

            // Invia tutte le modifiche al backend
            if (oModel.hasPendingChanges()) {
                oModel.submitChanges({
                    success: () => {
                        sap.m.MessageToast.show(`${this._aSelectedItems.length} righe aggiornate correttamente`);
                        this._oDialog.close();
                    },
                    error: (oError) => {
                        sap.m.MessageBox.error("Errore durante l'aggiornamento");
                        console.error(oError);
                    }
                });
            } else {
                sap.m.MessageToast.show("Nessuna modifica da salvare");
                this._oDialog.close();
            }
        }
    });
});