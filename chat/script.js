document.addEventListener('DOMContentLoaded', function () {
    // DOM-Elemente
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const newChatSidebar = document.getElementById('new-chat-sidebar');
    const newChatMain = document.getElementById('new-chat-main');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const emptyState = document.getElementById('empty-state');
    const topicButtons = document.querySelectorAll('.topic-button');
    const chatMoreButtons = document.querySelectorAll('.chat-more-button');
    const chatMenu = document.getElementById('chat-menu');
    const dialogBackdrop = document.getElementById('dialog-backdrop');
    const renameDialog = document.getElementById('rename-dialog');
    const deleteDialog = document.getElementById('delete-dialog');
    const chatInputContainer = document.querySelector('.chat-input-container');

    // Aktuelle Chat-ID für Aktionen
    let currentChatId = null;

    // Zentrale Dropdown-Funktionalität
    function setupDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const dropdownId = dropdown.getAttribute('data-dropdown');
            const dropdownContent = document.querySelector(`[data-dropdown-content="${dropdownId}"]`);

            if (!dropdown || !dropdownContent) return;

            dropdown.addEventListener('click', function (event) {
                event.stopPropagation();

                // Alle anderen Dropdowns schließen
                document.querySelectorAll('.dropdown-content').forEach(content => {
                    if (content !== dropdownContent) {
                        content.classList.remove('show');
                    }
                });

                // Position des Dropdowns anpassen
                const rect = dropdown.getBoundingClientRect();
                dropdownContent.style.top = `${rect.bottom + 5}px`;
                dropdownContent.style.left = `${rect.left}px`;
                dropdownContent.style.width = `${dropdown.offsetWidth}px`;

                // Dropdown anzeigen/ausblenden
                dropdownContent.classList.toggle('show');
            });

            // Dropdown-Items Klick-Handler
            const dropdownItems = dropdownContent.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', function (event) {
                    event.stopPropagation();

                    // Aktiven Status setzen
                    dropdownItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    // Ausgewählten Text im Dropdown anzeigen
                    dropdown.querySelector('.dropdown-selected').textContent = item.textContent.trim();

                    // Dropdown schließen
                    dropdownContent.classList.remove('show');
                });
            });
        });

        // Dropdown schließen wenn außerhalb geklickt wird
        document.addEventListener('click', function () {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('show');
            });
        });
    }

    // Zentrale Dialog-Funktionalität
    function setupDialogs() {
        // Dialog öffnen
        function openDialog(dialog) {
            dialogBackdrop.classList.add('show');
            dialog.classList.add('show');
        }

        // Dialog schließen
        function closeDialog(dialog) {
            dialogBackdrop.classList.remove('show');
            dialog.classList.remove('show');
        }

        // Alle Dialog-Schließen-Buttons
        document.querySelectorAll('.close-dialog').forEach(button => {
            button.addEventListener('click', function () {
                const dialog = button.closest('.dialog');
                closeDialog(dialog);
            });
        });

        // Backdrop-Klick schließt alle Dialoge
        dialogBackdrop.addEventListener('click', function () {
            document.querySelectorAll('.dialog.show').forEach(dialog => {
                closeDialog(dialog);
            });
        });

        // Abbrechen-Buttons in Dialogen
        document.getElementById('cancel-rename').addEventListener('click', () => closeDialog(renameDialog));
        document.getElementById('cancel-delete').addEventListener('click', () => closeDialog(deleteDialog));

        // Bestätigungs-Buttons in Dialogen
        document.getElementById('confirm-rename').addEventListener('click', function () {
            const newName = document.getElementById('rename-input').value.trim();
            if (newName && currentChatId) {
                // Chat umbenennen
                const chatItem = document.querySelector(`.chat-item .chat-more-button[data-chat-id="${currentChatId}"]`).closest('.chat-item');
                chatItem.querySelector('.chat-item-content span').textContent = newName;
                closeDialog(renameDialog);
            }
        });

        document.getElementById('confirm-delete').addEventListener('click', function () {
            if (currentChatId) {
                // Chat löschen
                const chatItem = document.querySelector(`.chat-item .chat-more-button[data-chat-id="${currentChatId}"]`).closest('.chat-item');
                chatItem.remove();
                closeDialog(deleteDialog);

                // Leeren Zustand anzeigen, wenn das der aktive Chat war
                if (chatItem.classList.contains('active')) {
                    emptyState.classList.remove('hidden');
                    chatMessages.querySelectorAll('.message').forEach(msg => {
                        msg.classList.add('hidden');
                    });
                }
            }
        });

        return { openDialog, closeDialog };
    }

    // Kontext-Menü für Chats
    function setupContextMenu() {
        // Kontext-Menü anzeigen
        chatMoreButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation();

                // Chat-ID speichern
                currentChatId = this.getAttribute('data-chat-id');

                // Position des Menüs anpassen
                const rect = this.getBoundingClientRect();
                chatMenu.style.top = `${rect.bottom + 5}px`;
                chatMenu.style.left = `${rect.left - 150 + this.offsetWidth}px`;

                // Menü anzeigen
                chatMenu.classList.add('show');
            });
        });

        // Menü schließen wenn außerhalb geklickt wird
        document.addEventListener('click', function () {
            chatMenu.classList.remove('show');
        });

        // Menü-Item Klick-Handler
        const menuItems = chatMenu.querySelectorAll('.context-menu-item');
        const { openDialog } = setupDialogs();

        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                const action = this.getAttribute('data-action');

                switch (action) {
                    case 'rename':
                        const chatName = document.querySelector(`.chat-item .chat-more-button[data-chat-id="${currentChatId}"]`).closest('.chat-item').querySelector('.chat-item-content span').textContent;
                        document.getElementById('rename-input').value = chatName;
                        openDialog(renameDialog);
                        break;

                    case 'delete':
                        openDialog(deleteDialog);
                        break;

                    case 'prompts':
                    case 'instructions':
                    case 'share':
                    case 'export':
                        alert(`Funktion "${action}" wurde aufgerufen für Chat #${currentChatId}`);
                        break;
                }

                // Menü schließen
                chatMenu.classList.remove('show');
            });
        });
    }

    // Sidebar ein-/ausblenden
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar-hidden');

        // Neuer-Chat-Button anzeigen/ausblenden
        if (sidebar.classList.contains('sidebar-hidden')) {
            newChatMain.classList.remove('hidden');
        } else {
            newChatMain.classList.add('hidden');
        }
    }

    sidebarToggle.addEventListener('click', toggleSidebar);

    // Neuer Chat
    function createNewChat() {
        // Chat zurücksetzen
        chatMessages.querySelectorAll('.message').forEach(msg => {
            msg.classList.add('hidden');
        });

        // Leeren Zustand anzeigen
        emptyState.classList.remove('hidden');

        // Chat-Input leeren
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendButton.disabled = true;

        // Fokus auf Chat-Input setzen
        chatInput.focus();
    }

    newChatSidebar.addEventListener('click', createNewChat);
    newChatMain.addEventListener('click', createNewChat);

    // Chat-Input automatisch vergrößern/verkleinern
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';

        // Send-Button aktivieren/deaktivieren
        sendButton.disabled = this.value.trim() === '';
    });

    // Nachricht senden
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Leeren Zustand ausblenden
        emptyState.classList.add('hidden');

        // Benutzer-Nachricht hinzufügen
        const userMessageTemplate = document.querySelector('.user-message');
        const userMessageClone = userMessageTemplate.cloneNode(true);
        userMessageClone.classList.remove('hidden');
        userMessageClone.querySelector('.message-text').textContent = message;
        chatMessages.appendChild(userMessageClone);

        // Chat-Input zurücksetzen
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendButton.disabled = true;

        // Automatisches Scrollen zum Ende des Chats
        userMessageClone.scrollIntoView({ behavior: 'smooth', block: 'end' });

        // Simulierte Bot-Antwort nach kurzer Verzögerung
        setTimeout(function () {
            const botMessageTemplate = document.querySelector('.bot-message');
            const botMessageClone = botMessageTemplate.cloneNode(true);
            botMessageClone.classList.remove('hidden');

            // Angepasste Antwort
            let response = "Ich helfe dir gerne! Wie kann ich dir mit deinem Anliegen weiterhelfen?";
            if (message.toLowerCase().includes('code') || message.toLowerCase().includes('programmier')) {
                response = "Ich kann dir gerne mit deinem Code helfen. Bitte teile mir mehr Details mit, damit ich dir eine spezifische Lösung anbieten kann.";
            } else if (message.toLowerCase().includes('fehler') || message.toLowerCase().includes('bug')) {
                response = "Um dir bei dem Fehler zu helfen, bräuchte ich mehr Kontext. Kannst du mir den Code und die Fehlermeldung zeigen?";
            }

            botMessageClone.querySelector('.message-text').textContent = response;
            chatMessages.appendChild(botMessageClone);

            // Automatisches Scrollen zum Ende des Chats
            botMessageClone.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 800);
    }

    // Topic-Buttons Handling
    topicButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Leeren Zustand ausblenden
            emptyState.classList.add('hidden');

            // Benutzer-Nachricht basierend auf dem Thema erstellen
            const topic = this.querySelector('span').textContent;
            const userMessageTemplate = document.querySelector('.user-message');
            const userMessageClone = userMessageTemplate.cloneNode(true);
            userMessageClone.classList.remove('hidden');
            userMessageClone.querySelector('.message-text').textContent = `Ich brauche Hilfe mit ${topic}`;
            chatMessages.appendChild(userMessageClone);

            // Simulierte Bot-Antwort
            setTimeout(function () {
                const botMessageTemplate = document.querySelector('.bot-message');
                const botMessageClone = botMessageTemplate.cloneNode(true);
                botMessageClone.classList.remove('hidden');

                let response = "";
                switch (topic) {
                    case "Code schreiben":
                        response = "Ich helfe dir gerne beim Schreiben von Code. Welche Programmiersprache verwendest du und was möchtest du erreichen?";
                        break;
                    case "Fehler beheben":
                        response = "Um dir bei der Fehlerbehebung zu helfen, benötige ich den problematischen Code und idealerweise die Fehlermeldung. Kannst du beides teilen?";
                        break;
                    case "Ideen vorschlagen":
                        response = "Ich bin bereit, dir Ideen vorzuschlagen. In welchem Bereich oder für welches Projekt brauchst du Inspiration?";
                        break;
                    case "Fragen beantworten":
                        response = "Ich beantworte gerne deine Fragen. Was möchtest du wissen?";
                        break;
                    default:
                        response = "Wie kann ich dir heute helfen?";
                }

                botMessageClone.querySelector('.message-text').textContent = response;
                chatMessages.appendChild(botMessageClone);

                // Automatisches Scrollen zum Ende des Chats
                botMessageClone.scrollIntoView({ behavior: 'smooth', block: 'end' });

                // Fokus auf Chat-Input setzen
                chatInput.focus();
            }, 800);
        });
    });

    // Chat-Liste Handling
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function (e) {
            // Verhindere, dass der Klick auf den More-Button auch den Chat aktiviert
            if (e.target.closest('.chat-more-button')) {
                return;
            }

            // Aktiven Zustand umschalten
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Simuliere Chat-Inhalt anzeigen
            emptyState.classList.add('hidden');

            // In mobiler Ansicht Sidebar nach Klick ausblenden
            if (window.innerWidth <= 768) {
                sidebar.classList.add('sidebar-hidden');
                newChatMain.classList.remove('hidden');
            }
        });
    });

    // Initialisierung der Komponenten
    setupDropdowns();
    setupContextMenu();

    // Initial ist die Sidebar eingeblendet und der Neuer-Chat-Button im Hauptbereich ausgeblendet
    newChatMain.classList.add('hidden');

    // Anpassen des Layouts bei Fenstergröße-Änderungen
    window.addEventListener('resize', function () {
        if (sidebar.classList.contains('sidebar-hidden')) {
            newChatMain.classList.remove('hidden');
        } else {
            newChatMain.classList.add('hidden');
        }
    });
});