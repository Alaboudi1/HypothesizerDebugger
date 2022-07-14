import { TimelineItemModel } from "react-chrono/dist/models/TimelineItemModel";
import { Media } from "react-chrono/dist/models/TimelineMediaModel";

export type Filter = {
    filterBy: "filename" | "type";
    condition: string;
    enabled: boolean;
}

export interface Trace {
    events:   Event[];
    coverage: Coverage[];
}

export interface Event {
    target?:        string;
    type:           string;
    location:       Location;
    srcElement?:    SrcElement;
    timestamp:      number;
    key?:           string;
    addNode?:       Location[];
    removeNode?:    Location[];
    attributeName?: null | string;
    value?:         string;
    tagName?:       string;
}

export interface Coverage {
    coverage:        string[];
    lineBundleStart: number;
    lineBundleEnd:   number;
    startPosition:   Position;
    endPosition:     Position;
    functionName:    string;
    isBlockCoverage: boolean;
    ranges:          Range[];
    url:             string;
    timestamp:       number;
    id?:             number;
    src?: string| undefined;
}

export interface Position {
    source: string;
    line:   number;
    column: number;
    name:   null;
}

export interface Range {
    count:       number;
    endOffset:   number;
    startOffset: number;
}

export interface Location {
    fileName:     string;
    lineNumber:   number;
    columnNumber: number;
}

export interface SrcElement {
    value?:  string;
    tagName: string;
}

export interface HypoTimelineItem extends TimelineItemModel {
    coverage?: string[]
    active?: boolean;
    cardDetailedText?: string | string[];
    cardSubtitle?: string;
    cardTitle?: string;
    id?: string;
    media?: Media;
    position?: string;
    title?: string;
    url?: string;
    src: string | undefined;
    visible?: boolean;
    timestamp?: string;
  }