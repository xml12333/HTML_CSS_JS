"use strict";

/**
 * Import module
 */
import { NavItem } from "./components/NavItem.js";
import { activeNotebook } from "./utils.js";
import { Card } from "./components/Card.js";

const /** {HTMLElement} */ $sidebarList = document.querySelector(
    "[data-sidebar-list]"
  );
const /** {HTMLElement} */ $notePanelTitle = document.querySelector(
    "[data-note-panel-title]"
  );
const /** {HTMLElement} */ $notePanel =
    document.querySelector("[data-note-panel]");

const /** {Array<HTMLElement>} */ $noteCreateBtns = document.querySelectorAll(
    "[data-note-create-btn]"
  );

const /** {string} */ emptyNotesTemplate = ` <div class="empty-notes">
    <span class="material-symbols-rounded" aria-hidden="true">note_stack</span>
    <div class="text-headline-small">No notes</div>
  </div>`;

/**
 * Enables or disables "Create Note" buttons based on whether there are any notebooks.
 *
 * @param {boolean} isThereAnyNotebooks  - Indicates whether there ara any notebooks
 */
const didableNoteCreateBtns = function (isThereAnyNotebooks) {
  $noteCreateBtns.forEach(($item) => {
    $item[isThereAnyNotebooks ? "removeAttribute" : "setAttribute"](
      "disabled",
      ""
    );
  });
};

/**
 * the client object manages interactions with the user interface (UI) to create, read, update, and delete notebooks and notes.
 * It provides functions for performing these operations and updating the UI accordingly
 *
 * @namespace
 * @property {Object} notebook - Functions for managing notebooks in the UI.
 * @property {Object} note - Functions for managing notes in the UI.
 */
export const client = {
  notebook: {
    /**
     * Creates a new notebook in the UI, based on provided notebook data.
     *
     * @param {Objec} notebookData - Data representing the new notebook.
     */
    create(notebookData) {
      const /** {HTMLElement} */ $navItem = NavItem(
          notebookData.id,
          notebookData.name
        );
      $sidebarList.appendChild($navItem);
      activeNotebook.call($navItem);
      $notePanelTitle.textContent = notebookData.name;
      $notePanel.innerHTML = emptyNotesTemplate;
      didableNoteCreateBtns(true);
    },
    /**
     * Reads and displays alist of notebooks in the UI.
     *
     * @param {Array<Object>} notebookList - list of notebook data to display.
     */
    read(notebookList) {
      didableNoteCreateBtns(notebookList.length);
      notebookList.forEach((notebookData, index) => {
        const /** {HTMLElement} */ $navItem = NavItem(
            notebookData.id,
            notebookData.name
          );
        if (index === 0) {
          activeNotebook.call($navItem);
          $notePanelTitle.textContent = notebookData.name;
        }
        $sidebarList.appendChild($navItem);
      });
    },
    /**
     * Updates the UI to reflect change in a notebook.
     *
     * @param {string} notebookId - ID of the notebook to update.
     * @param {*} notebookData - New data for notebook.
     */
    update(notebookId, notebookData) {
      const /** {HTMLElement} */ $oldNotebook = document.querySelector(
          `[data-notebook="${notebookId}"]`
        );
      const /** {HTMLElement} */ $newNotebook = NavItem(
          notebookData.id,
          notebookData.name
        );
      $notePanelTitle.textContent = notebookData.name;
      $sidebarList.replaceChild($newNotebook, $oldNotebook);
      activeNotebook.call($newNotebook);
    },
    /**
     * Deletes a notebook from the UI
     *
     * @param {string} notebookId  - ID of the notebook to delete
     */
    delete(notebookId) {
      const /** {HTMLElement} */ $deletedNotebook = document.querySelector(
          `[data-notebook="${notebookId}"]`
        );
      const /** {HTMLElement | null} */ $activeNavItem =
          $deletedNotebook.nextElementSibling ??
          $deletedNotebook.previousElementSibling;
      if ($activeNavItem) {
        $activeNavItem.click();
      } else {
        $notePanelTitle.innerHTML = ``;
        $notePanel.innerHTML = "";
        didableNoteCreateBtns(false);
      }
      $deletedNotebook.remove();
    },
  },
  note: {
    /**
     * Creates a new note card in the UI based on provided note data.
     *
     * @param {Object} noteData  - Data representing the new note.
     */
    create(noteData) {
      // Clear 'emptyNotesTemplate' from 'notePanel' if there is no note exists
      if (!$notePanel.querySelector("[data-note")) $notePanel.innerHTML = "";
      // Append card in notePanel
      const /** {HTMLElement} */ $card = Card(noteData);
      $notePanel.prepend($card);
    },
    /**
     * Reads and displays a list of notes in the UI.
     *
     * @param {Array<Object>} noteList - List of note data to display.
     */
    read(noteList) {
      if (noteList.length) {
        $notePanel.innerHTML = "";
        noteList.forEach((noteData) => {
          const /** {HTMLElement} */ $card = Card(noteData);
          $notePanel.appendChild($card);
        });
      } else {
        $notePanel.innerHTML = emptyNotesTemplate;
      }
    },
    /**
     * Updates a note card in the UI based on provided note data.
     *
     * @param {string} noteId - ID of the note to update.
     * @param {Object} noteData - New data for the note.
     */
    update(noteId, noteData) {
      const /** {HTMLElement} */ $oldCard = document.querySelector(
          `[data-note="${noteId}"]`
        );
      const /** {HTMLElement} */ $newCard = Card(noteData);
      $notePanel.replaceChild($newCard, $oldCard);
    },
    /**
     * Deletes a note card from the UI.
     *
     * @param {string} noteId - ID of the note to delete.
     * @param {boolean} isNoteExists - Indicates whether other notes still exist.
     *
     */
    delete(noteId, isNoteExists) {
      document.querySelector(`[data-note="${noteId}"]`).remove();
      if (!isNoteExists) $notePanel.innerHTML = emptyNotesTemplate;
    },
  },
};
