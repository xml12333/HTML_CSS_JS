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
  },
};
