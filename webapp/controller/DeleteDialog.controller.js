sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, ODataModel) {
    "use strict";

    return Controller.extend("project1.controller.CreateDialog", {
        onCancel: function () {
            this._oDialog.close();
        },
        setSelectedItems: function (aSelectedItems) {
            this._aSelectedItems = aSelectedItems;
        },
        onConfirmSingleDelete: function () {
            if (!this._aSelectedItems || this._aSelectedItems.length === 0) {
                sap.m.MessageBox.warning("Nessuna riga selezionata.");
                return;
            }

            const oModel = this.ottieniModel();
            let deletedCount = 0;
            let errorCount = 0;

            sap.ui.core.BusyIndicator.show(0);

            // Promessa per ogni delete singola
            const deletePromises = this._aSelectedItems.map(item => {
                return new Promise((resolve, reject) => {
                    const oContext = item.getBindingContext();
                    const sPath = oContext.getPath();
                
                    oModel.remove(sPath, {
                        success: function() {
                            deletedCount++;
                          //  console.log(`Riga eliminata: ${sPath}`);
                            resolve();
                        },
                        error: function(oError) {
                            errorCount++;
                            console.error(`Errore eliminazione ${sPath}:`, oError);
                            reject(oError);
                        }
                    });
                });
            });

            // Attendi che tutte le delete siano completate
            Promise.allSettled(deletePromises).then(() => {
                sap.ui.core.BusyIndicator.hide();
                
                if (errorCount === 0) {
                    sap.m.MessageBox.success(`${deletedCount} righe eliminate con successo!`);
                } else {
                    sap.m.MessageBox.warning(
                        `Eliminate ${deletedCount} righe. ${errorCount} errori.`
                    );
                }

                oModel.refresh();
                this._oDialog.close();
            });
        },
        onConfirmBatchDelete: function() {
            if (!this._aSelectedItems || this._aSelectedItems.length === 0) {
                sap.m.MessageBox.warning("Nessuna riga selezionata.");
                return;
            }

            const oModel = this.ottieniModel();
            
            sap.ui.core.BusyIndicator.show(0);

            // Imposta il modello in modalità deferred per batch
            oModel.setDeferredGroups(["batchDelete"]);

            // Aggiungi tutte le delete al batch
            this._aSelectedItems.forEach(item => {
                const oContext = item.getBindingContext();
                const sPath = oContext.getPath();
                
                oModel.remove(sPath, {
                    groupId: "batchDelete"
                });
            });

            // Esegui il batch
            oModel.submitChanges({
                groupId: "batchDelete",
                success: (oData) => {
                    sap.ui.core.BusyIndicator.hide();
                    
                    // Analizza la risposta batch
                    const batchResponse = oData.__batchResponses || [];
                    let successCount = 0;
                    let errorCount = 0;

                    batchResponse.forEach(response => {
                        if (response.response) {
                            // Controlla lo status code
                            const statusCode = parseInt(response.response.statusCode);
                            if (statusCode >= 200 && statusCode < 300) {
                                successCount++;
                            } else {
                                errorCount++;
                            }
                        } else if (response.__changeResponses) {
                            // Batch con changeResponses
                            response.__changeResponses.forEach(change => {
                                const statusCode = parseInt(change.statusCode);
                                if (statusCode >= 200 && statusCode < 300) {
                                    successCount++;
                                } else {
                                    errorCount++;
                                }
                            });
                        }
                    });

                    if (errorCount === 0) {
                        sap.m.MessageBox.success(
                            `Batch completato! ${successCount} righe eliminate.`
                        );
                    } else {
                        sap.m.MessageBox.warning(
                            `Batch completato con errori. Successo: ${successCount}, Errori: ${errorCount}`
                        );
                    }

                    oModel.refresh();
                    this._oDialog.close();
                },
                error: (oError) => {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Errore batch delete:", oError);
                    sap.m.MessageBox.error("Errore durante l'eliminazione batch.");
                    this._oDialog.close();
                }
            });
        },
        ottieniModel: function () {
            return this._oDialog.getModel();
        },
        ottieniDialog: function () {
            return this._oDialog;
        },
        setDialog: function (oDialog) {
            this._oDialog = oDialog;
        },
    });
});