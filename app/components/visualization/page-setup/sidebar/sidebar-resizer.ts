import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SidebarResizer extends Component {
  @action
  setup() {
    const dragButton = document.getElementById('sidebarDragButton');
    const buttonContainer = document.getElementById('sidebarButtonContainer');

    // Init drag functionality
    if (dragButton) {
      this.dragElement(dragButton);
      if (buttonContainer) {
        buttonContainer.appendChild(dragButton);
      }
    }

    // Init sidebar width
    const sidebarWidthInPercent = Number(
      localStorage.getItem('sidebarWithInPercent')
    );
    if (typeof sidebarWidthInPercent == 'number') {
      this.setSidebarWidth(sidebarWidthInPercent);
    }
  }

  setSidebarWidth(widthInPercent: number) {
    const sidebar = document.getElementById('dataselection');

    if (sidebar && widthInPercent > 20) {
      sidebar.style.maxWidth = `${widthInPercent}%`;
      localStorage.setItem('sidebarWithInPercent', widthInPercent.toString());
    }
  }

  dragElement(resizeButton: HTMLElement) {
    const handleDragInput = (targetX: number) => {
      const buttonOffset = 30;
      const widthInPercent =
        100 - ((targetX - buttonOffset) / window.innerWidth) * 100;

      this.setSidebarWidth(widthInPercent);
    };

    const cancelDragElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
      document.ontouchcancel = null;
      document.ontouchend = null;
      document.ontouchmove = null;
    };

    const elementMouseDrag = (e: MouseEvent) => {
      const event = e || window.event;
      event.preventDefault();

      handleDragInput(e.clientX);
    };

    const elementTouchDrag = (e: TouchEvent) => {
      const event = e || window.event;
      event.preventDefault();

      if (event.targetTouches.length < 1) {
        cancelDragElement();
      } else {
        const { clientX } = event.targetTouches[0];

        handleDragInput(clientX);
      }
    };

    const dragMouseDown = (e: MouseEvent) => {
      const event = e || window.event;
      event.preventDefault();

      document.onmouseup = cancelDragElement;
      // Call a function whenever the cursor moves:
      document.onmousemove = elementMouseDrag;
    };

    const dragTouchDown = (e: TouchEvent) => {
      const event = e || window.event;
      event.preventDefault();

      if (event.targetTouches.length > 0) {
        document.ontouchcancel = cancelDragElement;
        document.ontouchend = cancelDragElement;

        document.ontouchmove = elementTouchDrag;
      }
    };

    resizeButton.onmousedown = dragMouseDown;
    resizeButton.ontouchstart = dragTouchDown;
  }
}
