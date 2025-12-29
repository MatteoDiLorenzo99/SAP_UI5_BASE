sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "project1/controller/CreateDialog.controller",
    "project1/controller/DeleteDialog.controller",
    "project1/controller/UpdateDialogSingle.controller",
    "project1/controller/UpdateDialogMultiple.controller",
    "project1/controller/UploadDialog.controller"
], (Controller, CreateDialogController, DeleteDialogController, UpdateDialogControllerSingle, UpdateDialogControllerMultiple, UploadDialogController) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        //INITIAL METHODS -> INITIALIZATION, RENDERING AND AFTER RENDERING.
        onInit() {
        },
        onBeforeRendering(){
        },
        onAfterRendering(){
            const view = this.ottieniView();
            const table = this.ottieniTable(view);
        },
        //ACTION LISTENERS FOR BUTTONS AND SWITCH TO OTHER CONTROLLERS AND DIALOGS
        onPressCreate: async function(){
            if (this._oCreateDialogController){
                this._oCreateDialogController.destroy();
            }
            
            if (this._oDialogToCreate) {
                this._oDialogToCreate.destroy();
                this._oDialogToCreate = null;
            }

            if(!this._oCreateDialog){
                this._oCreateDialogController = new CreateDialogController();
                var name = "project1.view.Create";
                var DialogToOpen = await this.caricaFragment(name, this._oCreateDialogController); // <- qui serve 'this.'
                DialogToOpen.open();
            }
        },
        onPressDelete: async function(){
            // Ottieni la SmartTable
            var oSmartTable = this.byId("IDtable");
            // Ottieni la tabella interna (può essere sap.m.Table o sap.ui.table.Table)
            var oTable = oSmartTable.getTable();
            // Array per le righe selezionate
            var aSelectedItems = [];

            aSelectedItems = this.ottieniRigheSelezionate(oTable);
                //PRINT SELECTED ROWS
                //            aSelectedItems.forEach(item => {
                //                var oContext = item.getBindingContext();
                //                var oData = oContext.getObject(); // <-- qui ottieni i dati della riga
                //                console.log(oData);
                //            }); 
                //            console.log(aSelectedItems);
  

            // Verifica se ci sono righe selezionate
            if (aSelectedItems.length === 0) {
                sap.m.MessageBox.warning("Seleziona almeno una riga da eliminare.");
                return;
            }
            

            // Ottieni le chiavi delle righe selezionate
            var aKeys = aSelectedItems.map(item => item.getBindingContext().getObject().NumeroTreno); 
            var sMessage = `Stai per eliminare ${aSelectedItems.length} righe, le cui chiavi sono:\n\n${aKeys.join(", ")}\n\nSei sicuro di voler procedere all'eliminazione?`;
            
            console.log(sMessage);

            if (this._oDeleteDialogController){
                this._oDeleteDialogController.destroy();
            }  
            if (this._oDialogToCreate) {
                this._oDialogToCreate.destroy();
                this._oDialogToCreate = null;
            }

            if(!this._oCreateDialog){
                this._oDeleteDialogController = new DeleteDialogController();
                this._oDeleteDialogController.setSelectedItems(aSelectedItems);

                var name = "project1.view.Delete";
                var DialogToOpen = await this.caricaFragment(name, this._oDeleteDialogController);
                
                var oTextMessage = sap.ui.getCore().byId("DeleteMessage") || this.getView().byId("DeleteMessage");
    
                // Se l'ID è univoco e caricato correttamente:
                if (oTextMessage) {
                    oTextMessage.setText(sMessage);
                }   
                // Aggiorna il testo del dialog
                DialogToOpen.open();
            }

        },
        onPressUpdate: async function() {
            var oSmartTable = this.ottieniTable(this);
            var oTable = oSmartTable.getTable();

            var aSelectedItems = this.ottieniRigheSelezionate(oTable);

            if (aSelectedItems.length === 0) {
                sap.m.MessageBox.warning("Seleziona almeno una riga da modificare.");
                return;
            }

            // Distruggi eventuali dialog già aperti
            if (this._oUpdateDialogController) {
                this._oUpdateDialogController.destroy();
            }
            if (this._oDialogToCreate) {
                this._oDialogToCreate.destroy();
                this._oDialogToCreate = null;
            }

            // Differenzia tra singolo update e multi-edit
            if (aSelectedItems.length === 1) {
                // Aggiornamento singolo
                this._oUpdateDialogController = new UpdateDialogControllerSingle();
                var name = "project1.view.UpdateSingle";
                var oContext = aSelectedItems[0].getBindingContext();
            } else {
                // MultiEdit
                this._oUpdateDialogController = new UpdateDialogControllerMultiple();
                var name = "project1.view.UpdateMultiple";
                var oContext = null;
                this._oUpdateDialogController.setContexts(aSelectedItems.map(item => item.getBindingContext()));
            }

            this._oUpdateDialogController.setSelectedItems(aSelectedItems);

            // Carica il fragment
            var DialogToOpen = await this.caricaFragment(name, this._oUpdateDialogController);

            // Imposta i contesti per il multi-edit
            if (oContext) {
                DialogToOpen.setBindingContext(oContext);
            } else {
                // MultiEdit: setta i context delle righe selezionate
                var aContexts = aSelectedItems.map(item => item.getBindingContext());
                DialogToOpen.getContent()[0].setContexts(aContexts); // supponendo che il Container sia il primo content
        //        sap.ui.core.syncStyleClass("sapUiSizeCompact", this.getView(), DialogToOpen);
            }

            DialogToOpen.open();
        },
        onRefreshPage: function(){
            var oSmartTable = this.ottieniTable(this);
            if (!oSmartTable) {
                sap.m.MessageToast.show("Tabella non trovata");
                return;
            }
            var oTable = oSmartTable.getTable();
            var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
            if (oBinding) {
                oBinding.refresh(true);
                sap.m.MessageToast.show("Contenuto aggiornato");
            } else {
                oSmartTable.rebindTable();
                sap.m.MessageToast.show("Dati ricaricati");
            }
        },
        onPressLoadExcel: async function () {
            // Create a JSON model for preview
            const oEmptyModel = new sap.ui.model.json.JSONModel({ items: [] });
            sap.ui.getCore().setModel(oEmptyModel, "preview");

            // Destroy previous dialog/controller if exists
            if (this._oUploadDialog) this._oUploadDialog.destroy();
            if (this._oUploadDialogController) this._oUploadDialogController.destroy();

            // Instantiate Upload controller
            this._oUploadDialogController = new UploadDialogController();

            // Pass model and router
            this._oUploadDialogController.setModel(oEmptyModel);
            this._oUploadDialogController.setRouter(this.getOwnerComponent().getRouter());

            var name = "project1.view.UploadDialog";

            // Load fragment
            this._oUploadDialog = await this.caricaFragment(
                name,
                this._oUploadDialogController
            );

            // Clear FileUploader input
            var oFileUploader = sap.ui.core.Fragment.byId("UploadDialog", "UploadFileUploader");
            if (oFileUploader) oFileUploader.setValue("");

            this._oUploadDialog.open();
        },
        caricaFragment: async function(nome, controller){
            this._oDialogToCreate = await sap.ui.core.Fragment.load({
                name: nome,
                controller: controller || this
            });

            controller.setDialog(this._oDialogToCreate);
            this.getView().addDependent(this._oDialogToCreate);

            return this._oDialogToCreate;
        },

        //METHODS FOR OBTAINING VIEW AND TABLE AND SELECTED ROWS
        ottieniView(){
            return this.getView();
        },
        ottieniTable(view){
            return view.byId("IDtable");
        },
        ottieniRigheSelezionate(tabella){
            var aSelectedItems = [];
            var aSelectedIndices = tabella.getSelectedIndices();
            aSelectedIndices.forEach(function(iIndex){
                var oContext = tabella.getContextByIndex(iIndex);
                if(oContext){
                    aSelectedItems.push({
                        getBindingContext: function() {
                            return oContext;
                        }
                    });
                }
            });
            return aSelectedItems;
        }
    });
});




















//        onPressCreate: async function () {
//                if(oController){
//                    oController.destroy();
//                 }
//             if (!this._oCreateDialog) {
//                 // Creazione istanza del controller dedicato
//                 var oController = new CreateDialogController();
// 
                // Caricamento fragment con controller dedicato
//                 this._oCreateDialog = await sap.ui.core.Fragment.load({
//                     name: "project1.view.Create",
//                     controller: oController
//                 });

//                 // Collega il dialog al controller
//                oController.setDialog(this._oCreateDialog);
// 
//                 // Aggiunge il dialog come dipendente della view principale
//                 this.getView().addDependent(this._oCreateDialog);
//             }
            // Apertura del dialog
//             this._oCreateDialog.open();
//         },