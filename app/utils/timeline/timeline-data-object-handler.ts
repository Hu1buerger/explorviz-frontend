import { tracked } from '@glimmer/tracking';
import { Timestamp } from '../landscape-schemes/timestamp';
import { inject as service } from '@ember/service';
import TimestampRepository from 'explorviz-frontend/services/repos/timestamp-repository';
import { setOwner } from '@ember/application';
import RenderingService from 'explorviz-frontend/services/rendering-service';
import { action } from '@ember/object';

export type TimelineDataForCommit = {
  timestamps: Timestamp[];
  highlightedMarkerColor: 'blue' | 'red';
  selectedTimestamps: Timestamp[];
  applicationNameAndBranchNameToColorMap: Map<string, string>;
};

export type TimelineDataObject = Map<
  string, // commit
  TimelineDataForCommit
>;

export default class TimelineDataObjectHandler {
  @service('repos/timestamp-repository')
  timestampRepo!: TimestampRepository;

  @service('rendering-service')
  renderingService!: RenderingService;

  @tracked timelineDataObject: TimelineDataObject = new Map();

  constructor(owner: any) {
    // https://stackoverflow.com/questions/65010591/emberjs-injecting-owner-to-native-class-from-component
    setOwner(this, owner);
    //this.timestampRepo.on('updated', this, this.updateTimestamps);
  }

  get timestamps() {
    return this.timelineDataObject.timestamps;
  }

  get selectedTimestamps() {
    return this.timelineDataObject.selectedTimestamps;
  }

  get highlightedMarkerColor() {
    return this.timelineDataObject.highlightedMarkerColor;
  }

  createEmptyTimelineDataForCommitObj(): TimelineDataForCommit {
    return {
      timestamps: [],
      highlightedMarkerColor: 'blue',
      selectedTimestamps: [],
      applicationNameAndBranchNameToColorMap: new Map(),
    };
  }

  setTimelineDataForCommit(
    timelineDataForCommit: TimelineDataForCommit,
    commitId: string
  ) {
    this.timelineDataObject.set(commitId, timelineDataForCommit);
  }

  getTimelineDataForCommit(commitId: string) {
    return this.timelineDataObject.get(commitId);
  }

  updateCommitTimestampsIfPresent(timestamps: Timestamp[], commitId: string) {
    if (timestamps && timestamps.length > 0) {
      this.updateTimestampsForCommit(timestamps, commitId);
    }
  }

  updateTimestampsForCommit(timestamps: Timestamp[], commitId: string) {
    const timelineDataForCommit =
      this.timelineDataObject.get(commitId) ??
      this.createEmptyTimelineDataForCommitObj();

    timelineDataForCommit.timestamps = timestamps;
    // reset, since it might be new
    this.setTimelineDataForCommit(timelineDataForCommit, commitId);
  }

  updateSelectedTimestampsForCommit(timestamps: Timestamp[], commitId: string) {
    const timelineDataForCommit = this.timelineDataObject.get(commitId);
    if (timelineDataForCommit) {
      timelineDataForCommit.selectedTimestamps = timestamps;
    }
  }

  updateHighlightedMarkerColorForCommit(
    highlightedMarkerColor: 'blue' | 'red',
    commitId: string
  ) {
    const timelineDataForCommit = this.timelineDataObject.get(commitId);
    if (timelineDataForCommit) {
      timelineDataForCommit.highlightedMarkerColor = highlightedMarkerColor;
    }
  }

  @action
  async timelineClicked(
    commitToSelectedTimestampMap: Map<string, Timestamp[]>
  ) {
    for (const [
      commitId,
      selectedTimestamps,
    ] of commitToSelectedTimestampMap.entries()) {
      const timelineData = this.getTimelineDataForCommit(commitId);

      if (
        timelineData &&
        timelineData.selectedTimestamps.length > 0 &&
        selectedTimestamps === timelineData.selectedTimestamps
      ) {
        return;
      }
    }

    this.renderingService.pauseVisualizationUpdating(false);

    this.renderingService.triggerRenderingForGivenTimestamps(
      commitToSelectedTimestampMap
    );
  }

  resetState() {
    this.timelineDataObject = new Map();
  }

  triggerTimelineUpdate() {
    // Calling this in each update function will multiple renderings,
    // therefore we manually call it when the updated data object is ready
    // Additionally, we can manually trigger this update after the gsap
    // animation of the play/pause icon

    // eslint-disable-next-line no-self-assign
    this.timelineDataObject = this.timelineDataObject;
  }
}
