"use strict";

/**
 * Import module
 */
import { NavItem } from "./components/NavItem.js";
import { activeNotebook } from "./utils.js";

const /** {HTMLElement} */ $sidebarList = document.querySelector(
    "[data-sidebar-list]"
  );
const /** {HTMLElement} */ $notePanelTitle = document.querySelector(
    "[data-note-panel-title]"
  );

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
    },
    /**
     * Reads and displays alist of notebooks in the UI.
     *
     * @param {Array<Object>} notebookList - list of notebook data to display.
     */
    read(notebookList) {
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
  },
};
