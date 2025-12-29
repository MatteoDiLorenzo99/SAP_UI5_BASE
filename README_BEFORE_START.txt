ita / eng
VERSION 1.0
Ciao! 
questo è un progetto base da cui si può partire per iniziare a creare applicazioni tramite SAP UI5.
il progetto è stato creato tramite l'utilizzo di ABAP ADT.
il codice completo con tutorial è fornito nella cartella project1->eclipse.

L'applicazione si prefissa di fornire all'utente un app che permetta queste funzioni:
-tabella, collegata con entity set.
    *salvare, creare, modificare VARIANTI
    *export tramite excel
-aggiornamento tramite bottone dell'entity set associato
-funzione di creazione riga
-funzione di edit:
    *single edit
    *multi edit
-funzione di cancellazione:
    *x riga
    *in batch
-funzione di caricamento di un file XLSX:
    *tramite l'utilizzo di router
    *con possibilità di eliminare righe
    *con possibilità di import nel DB

funzionalità generiche / aspetti stilistici utili:
-bottoni colorati
-routing
...

il programma è cosi strutturato:
all'avvio dell'applicazione vengono precaricati e salvati gli elementi fondamentali di utilizzo.
per ogni bottone viene creato un fragment.
ogni fragment ha un controller associato.
il fragment per il caricamento dell'excel, a sua volta, apre una view, che viene gestita nel manifest tramite l'utilizzo del NavTo.
ogni fragment/controller vengono distrutti alla chiusura del fragment/controller stesso.
il css è ridotto al minimo, cosi da mantenere lo standard SAP UI5.

NB: non siamo in java.
    -> qui con MVC non si intende lo stesso concetto della programmazione ad oggetti.
       in questo caso il MODEL è gestito tramite entity set.


