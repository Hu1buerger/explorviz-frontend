import { defaultApplicationColors } from './color-schemes';
import { ApplicationSettings } from './settings-schemas';

export const defaultApplicationSettings: ApplicationSettings = {
  // Color Settings
  foundationColor: {
    value: defaultApplicationColors.foundationColor,
    orderNumber: 1,
    group: 'Colors',
    displayName: 'Foundation',
    isColorSetting: true,
  },
  componentOddColor: {
    value: defaultApplicationColors.componentOddColor,
    orderNumber: 2,
    group: 'Colors',
    displayName: 'Component Odd',
    isColorSetting: true,
  },
  componentEvenColor: {
    value: defaultApplicationColors.componentEvenColor,
    orderNumber: 3,
    group: 'Colors',
    displayName: 'Component Even',
    isColorSetting: true,
  },
  clazzColor: {
    value: defaultApplicationColors.clazzColor,
    orderNumber: 4,
    group: 'Colors',
    displayName: 'Class',
    isColorSetting: true,
  },
  highlightedEntityColor: {
    value: defaultApplicationColors.highlightedEntityColor,
    orderNumber: 5,
    group: 'Colors',
    displayName: 'Highlighted Entity',
    isColorSetting: true,
  },
  componentTextColor: {
    value: defaultApplicationColors.componentTextColor,
    orderNumber: 6,
    group: 'Colors',
    displayName: 'Component Label',
    isColorSetting: true,
  },
  clazzTextColor: {
    value: defaultApplicationColors.clazzTextColor,
    orderNumber: 7,
    group: 'Colors',
    displayName: 'Class Label',
    isColorSetting: true,
  },
  foundationTextColor: {
    value: defaultApplicationColors.foundationTextColor,
    orderNumber: 8,
    group: 'Colors',
    displayName: 'Foundation Label',
    isColorSetting: true,
  },
  communicationColor: {
    value: defaultApplicationColors.communicationColor,
    orderNumber: 9,
    group: 'Colors',
    displayName: 'Communication',
    isColorSetting: true,
  },
  communicationArrowColor: {
    value: defaultApplicationColors.communicationArrowColor,
    orderNumber: 10,
    group: 'Colors',
    displayName: 'Communication Arrow',
    isColorSetting: true,
  },
  backgroundColor: {
    value: defaultApplicationColors.backgroundColor,
    orderNumber: 11,
    group: 'Colors',
    displayName: 'Background',
    isColorSetting: true,
  },
  // Control Settings
  enableGamepadControls: {
    value: true,
    orderNumber: 1,
    group: 'Controls',
    displayName: 'Enable Gamepad Controls',
    description: 'Toggle gamepad controls for navigation',
    isFlagSetting: true,
  },
  selectedGamepadIndex: {
    value: 0,
    range: {
      min: 0,
      max: 10,
      step: 1,
    },
    orderNumber: 2,
    group: 'Controls',
    displayName: 'Selected Gamepad Index',
    description: 'Index of the gamepad to be used for navigation',
    isRangeSetting: true,
  },
  // Highlighting Settings
  applyHighlightingOnHover: {
    value: true,
    orderNumber: 1,
    group: 'Highlighting',
    displayName: 'Only Apply Highlighting Effect on Hover',
    description:
      'Toggle to switch between permanent transparency effect and effect on hover',
    isFlagSetting: true,
  },
  keepHighlightingOnOpenOrClose: {
    value: true,
    orderNumber: 2,
    group: 'Highlighting',
    displayName: 'Keep Highlighting on Open or Close',
    description:
      'Toggle if highlighting should be reset on double click in application visualization',
    isFlagSetting: true,
  },
  transparencyIntensity: {
    value: 0.1,
    range: {
      min: 0.0,
      max: 1.0,
      step: 0.05,
    },
    orderNumber: 3,
    group: 'Highlighting',
    displayName: 'Transparency Intensity in Application Visualization',
    description:
      "Transparency effect intensity ('Enable Transparent Components' must be enabled)",
    isRangeSetting: true,
  },
  enableMultipleHighlighting: {
    value: true,
    orderNumber: 4,
    group: 'Highlighting',
    displayName: 'Enable Multiple Highlighting',
    description:
      'Toggle if highlighting should be kept on highlighting an unhighlighted component within the same application',
    isFlagSetting: true,
  },
  // Effect Settings
  enableHoverEffects: {
    value: true,
    orderNumber: 1,
    group: 'Effects',
    displayName: 'Enable Hover Effect',
    description: 'Hover effect (flashing entities) for mouse cursor',
    isFlagSetting: true,
  },
  enableAnimations: {
    value: true,
    orderNumber: 2,
    group: 'Effects',
    displayName: 'Enable Animations',
    description: 'Toggle animations for opening and closing components',
    isFlagSetting: true,
  },
  castShadows: {
    value: false,
    orderNumber: 3,
    group: 'Effects',
    displayName: 'Cast Shadows',
    description: 'Enable casting shadows from light (can be expensive)',
    isFlagSetting: true,
  },
  // Communication Settings
  commThickness: {
    value: 0.5,
    range: {
      min: 0.05,
      max: 1.5,
      step: 0.05,
    },
    orderNumber: 1,
    group: 'Communication',
    displayName: 'Communication Line Thickness',
    description: 'Factor that scales thickness of communication lines',
    isRangeSetting: true,
  },
  commArrowSize: {
    value: 1.0,
    range: {
      min: 0.0,
      max: 2.0,
      step: 0.25,
    },
    orderNumber: 2,
    group: 'Communication',
    displayName: 'Arrow Size in Application Visualization',
    description:
      'Arrow Size for selected communications in application visualization',
    isRangeSetting: true,
  },
  curvyCommHeight: {
    value: 1.0,
    range: {
      min: 0.0,
      max: 5.0,
      step: 0.1,
    },
    orderNumber: 3,
    group: 'Communication',
    displayName: 'Curviness Factor of the Communication Lines',
    description:
      'If greater 0.0, communication lines are rendered arc-shaped (Straight lines: 0.0)',
    isRangeSetting: true,
  },
  // Popup settings
  hidePopupDelay: {
    value: 1.0,
    range: {
      min: 0.0,
      max: 3.0,
      step: 0.25,
    },
    orderNumber: 1,
    group: 'Popups',
    displayName: 'Hide Popups After',
    description: 'Determines how many seconds popups stay on screen',
    isRangeSetting: true,
  },
  // Annotation Settings
  enableCustomAnnotationPosition: {
    value: true,
    orderNumber: 1,
    group: 'Annotations',
    displayName: 'Enable Custom Annotation Positioning',
    description:
      'If enabled, annotations can be dragged to a prefered, fixed position',
    isFlagSetting: true,
  },
  // Camera settings
  cameraNear: {
    value: 0.1,
    range: {
      min: 0.01,
      max: 5.0,
      step: 0.01,
    },
    orderNumber: 1,
    group: 'Camera',
    displayName: 'Render Near',
    description: 'Determines near render distance',
    isRangeSetting: true,
  },
  cameraFar: {
    value: 100,
    range: {
      min: 5.0,
      max: 150.0,
      step: 1.0,
    },
    orderNumber: 2,
    group: 'Camera',
    displayName: 'Render Far',
    description: 'Determines far render distance',
    isRangeSetting: true,
  },
  cameraFov: {
    value: 75,
    range: {
      min: 50.0,
      max: 150.0,
      step: 5.0,
    },
    orderNumber: 3,
    group: 'Camera',
    displayName: 'Field of View',
    description: 'Set field of view for the perspective camera',
    isRangeSetting: true,
  },
  // VR Settings
  showVrButton: {
    value: false,
    orderNumber: 1,
    group: 'Virtual Reality',
    displayName: 'Show VR Button',
    description: 'Toggle visibility of VR button',
    isFlagSetting: true,
  },
  showVrOnClick: {
    value: true,
    orderNumber: 2,
    group: 'Virtual Reality',
    displayName: 'Show VR in Browser',
    description: 'Shows the VR room in the browser after joining',
    isFlagSetting: true,
  },
  // Debug Settings
  showFpsCounter: {
    value: false,
    orderNumber: 1,
    group: 'Debugging',
    displayName: 'Show FPS Counter',
    description: "'Frames Per Second' metrics in visualizations",
    isFlagSetting: true,
  },
  showAxesHelper: {
    value: false,
    orderNumber: 2,
    group: 'Debugging',
    displayName: 'Show Axes Helper',
    description: 'Visualizes the Three Dimensional Cartesian Coordinate System',
    isFlagSetting: true,
  },
  showLightHelper: {
    value: false,
    orderNumber: 3,
    group: 'Debugging',
    displayName: 'Show Light Helper',
    description: 'Visualizes the Directional Light',
    isFlagSetting: true,
  },
  fullscreen: {
    value: false,
    orderNumber: 4,
    type: 'primary',
    group: 'Debugging',
    displayName: 'Fullscreen',
    description:
      'Enter canvas in fullscreen mode. Press escape key to leave fullscreen.',
    buttonText: 'Enter Fullscreen',
    isButtonSetting: true,
  },
  syncRoomState: {
    value: false,
    orderNumber: 5,
    type: 'danger',
    group: 'Debugging',
    displayName: 'Synchronize Room State',
    description: 'Sends current state of room to all users, use with caution.',
    buttonText: 'Synchronize',
    isButtonSetting: true,
  },
  resetToDefaults: {
    value: false,
    orderNumber: 6,
    type: 'danger',
    group: 'Debugging',
    displayName: 'Reset Settings to Default',
    description: 'Reset all settings to default values',
    buttonText: 'Reset',
    isButtonSetting: true,
  },
  // Minimap Settings
  minimap: {
    value: false,
    orderNumber: 1,
    group: 'Minimap',
    displayName: 'Enable Minimap',
    description: 'Toggle visibility of the minimap',
    isFlagSetting: true,
  },
  zoom: {
    value: 1,
    range: {
      min: 1.0,
      max: 3.0,
      step: 0.1,
    },
    orderNumber: 2,
    group: 'Minimap',
    displayName: 'Zoom of Minimap',
    description: 'Set zoom of the minimap',
    isRangeSetting: true,
  },
  version2: {
    value: true,
    orderNumber: 3,
    group: 'Minimap',
    displayName: 'Use Camera Position',
    description:
      'If off, calculate minimap position via intersection of camera with ground plane.',
    isFlagSetting: true,
  },
  layer1: {
    value: true,
    orderNumber: 4,
    group: 'Minimap',
    displayName: 'Enable foundation visibility',
    description: 'Toggle foundation visibility for the minimap',
    isFlagSetting: true,
  },
  layer2: {
    value: true,
    orderNumber: 5,
    group: 'Minimap',
    displayName: 'Enable component visibility',
    description: 'Toggle component visibility for the minimap',
    isFlagSetting: true,
  },
  layer3: {
    value: true,
    orderNumber: 6,
    group: 'Minimap',
    displayName: 'Enable clazz visibility',
    description: 'Toggle clazz visibility for the minimap',
    isFlagSetting: true,
  },
  layer4: {
    value: true,
    orderNumber: 7,
    group: 'Minimap',
    displayName: 'Enable communication visibility',
    description: 'Toggle communication visibility for the minimap',
    isFlagSetting: true,
  },
  layer6: {
    value: true,
    orderNumber: 8,
    group: 'Minimap',
    displayName: 'Enable labels visibility',
    description: 'Toggle labels visibility for the minimap',
    isFlagSetting: true,
  },
  layer7: {
    value: true,
    orderNumber: 9,
    group: 'Minimap',
    displayName: 'Enable visibility of different user-markers',
    description:
      'Toggle the different users position markers visibility for the minimap',
    isFlagSetting: true,
  },
};
