import * as THREE from "three";
import { WorkTimelinePoint } from "../types";

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: '2020',
    title: 'Tata Consultancy Services',
    subtitle: 'Systems Engineer',
    position: 'right',
  },
  {
    point: new THREE.Vector3(-4, -4, -3),
    year: '2023',
    title: 'University of Maryland Baltimore County',
    subtitle: 'Graduate Student Assistant',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-3, -1, -6),
    year: '2024',
    title: '407 Associates',
    subtitle: 'Data Analyst & Developer',
    position: 'left',
  },
  {
    point: new THREE.Vector3(0, -1, -10),
    year: '2024',
    title: 'Sciglob Instruments & Services + NASA GSFC',
    subtitle: 'Software Engineer',
    position: 'left',
  },
  {
    point: new THREE.Vector3(1, 1, -12),
    year: '2026',
    title: 'Open to Opportunities',
    subtitle: 'Full-stack, Cloud, and AI Engineering',
    position: 'right',
  }
]
