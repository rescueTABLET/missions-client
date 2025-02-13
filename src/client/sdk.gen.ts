// This file is auto-generated by @hey-api/openapi-ts

import type {
  Options as ClientOptions,
  TDataShape,
  Client,
} from "@hey-api/client-fetch";
import type {
  PostMissionData,
  PostMissionResponse,
  PostMissionError,
  EndMissionData,
  EndMissionResponse,
  EndMissionError,
  GetMissionData,
  GetMissionResponse,
  GetMissionError,
  UpdateMissionData,
  UpdateMissionResponse,
  UpdateMissionError,
  CreateMissionData,
  CreateMissionResponse,
  CreateMissionError,
  CreateMissionActionData,
  CreateMissionActionResponse,
  CreateMissionActionError,
  CreateMissionReportData,
  CreateMissionReportResponse,
  CreateMissionReportError,
  SetMissionReportPublicationStatusData,
  SetMissionReportPublicationStatusResponse,
  SetMissionReportPublicationStatusError,
  GetFileData,
  GetFileResponse,
  GetFileError,
  RequestFileUploadData,
  RequestFileUploadResponse,
  RequestFileUploadError,
  RemoveMissionResourceData,
  RemoveMissionResourceResponse,
  RemoveMissionResourceError,
  UpdateMissionResourceData,
  UpdateMissionResourceResponse,
  UpdateMissionResourceError,
  CreateMissionResourceData,
  CreateMissionResourceResponse,
  CreateMissionResourceError,
  RemoveMissionMapElementData,
  RemoveMissionMapElementResponse,
  RemoveMissionMapElementError,
  CreateMissionMapElementData,
  CreateMissionMapElementResponse,
  CreateMissionMapElementError,
  RemoveMissionSectionData,
  RemoveMissionSectionResponse,
  RemoveMissionSectionError,
  UpdateMissionSectionData,
  UpdateMissionSectionResponse,
  UpdateMissionSectionError,
  CreateMissionSectionData,
  CreateMissionSectionResponse,
  CreateMissionSectionError,
  RemoveMissionPatientData,
  RemoveMissionPatientResponse,
  RemoveMissionPatientError,
  UpdateMissionPatientData,
  UpdateMissionPatientResponse,
  UpdateMissionPatientError,
  CreateMissionPatientData,
  CreateMissionPatientResponse,
  CreateMissionPatientError,
  RemoveMissionAttendanceData,
  RemoveMissionAttendanceResponse,
  RemoveMissionAttendanceError,
  UpdateMissionAttendanceData,
  UpdateMissionAttendanceResponse,
  UpdateMissionAttendanceError,
  CreateMissionAttendanceData,
  CreateMissionAttendanceResponse,
  CreateMissionAttendanceError,
  PostMissionResourceData,
  PostMissionResourceResponse,
  PostMissionResourceError,
  GetMissionGroupsData,
  GetMissionGroupsResponse,
  SetMissionGroupData,
  SetMissionGroupResponse,
  GetGroupMissionsData,
  GetGroupMissionsResponse,
  AddMissionToGroupData,
  AddMissionToGroupResponse,
  SearchReportsData,
  SearchReportsResponse,
  SearchReportsError,
  GetReportData,
  GetReportResponse,
  GetReportError,
  ReopenMissionData,
  ReopenMissionResponse,
  ReopenMissionError,
  GetReportFileData,
  GetReportFileResponse,
  GetReportFileError,
  GetUserData,
  GetUserResponse,
  GetUserError,
  GetFirebaseConfigData,
  GetFirebaseConfigResponse,
  GetFirebaseConfigError,
  FindUsersData,
  FindUsersResponse,
  FindUsersError,
  DeleteUserData,
  DeleteUserResponse,
  DeleteUserError,
  CreateUserData,
  CreateUserResponse,
  CreateUserError,
  GetUserApiKeysData,
  GetUserApiKeysResponse,
  GetUserApiKeysError,
  CreateUserApiKeyData,
  CreateUserApiKeyResponse,
  CreateUserApiKeyError,
  DeleteUserApiKeyData,
  DeleteUserApiKeyResponse,
  DeleteUserApiKeyError,
  GetPutMissionData,
  GetPutMissionResponse,
  GetPutMissionError,
  GetUpdateResourceData,
  GetUpdateResourceError,
  GetTranslationsData,
  GetTranslationsResponse,
} from "./types.gen";
import { client as _heyApiClient } from "./client.gen";

export type Options<
  TData extends TDataShape = TDataShape,
  ThrowOnError extends boolean = boolean,
> = ClientOptions<TData, ThrowOnError> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
};

/**
 * Create or update a mission
 * Create or update a missions based on an external identifier.
 *
 * The preferred method to create or update missions is `PUT /missions/{id}`.
 * But if your architecture does not allow you to maintain a mapping between
 * your system's mission IDs and those from this API, you can use this `POST`
 * method.
 *
 * We identify missions with the combination of your API key and the mission
 * property `externalId`. The mapping will be kept for at least 24 hours after
 * the last update to the mission.
 *
 * If you pass the property `groupIds`, the mission will only be created for
 * these mission groups. Otherwise it will be visible in all groups that you
 * have write access to.
 *
 * Note that this operation completely replaces the state of the mission. Any
 * existing resources, actions or reports that are not present in the payload
 * will be removed from the mission.
 *
 */
export const postMission = <ThrowOnError extends boolean = false>(
  options: Options<PostMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<
    PostMissionResponse,
    PostMissionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * End an active mission
 */
export const endMission = <ThrowOnError extends boolean = false>(
  options: Options<EndMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    EndMissionResponse,
    EndMissionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}",
    ...options,
  });
};

/**
 * Get a mission
 */
export const getMission = <ThrowOnError extends boolean = false>(
  options: Options<GetMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetMissionResponse,
    GetMissionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}",
    ...options,
  });
};

/**
 * Update details of an active mission
 */
export const updateMission = <ThrowOnError extends boolean = false>(
  options: Options<UpdateMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<
    UpdateMissionResponse,
    UpdateMissionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Create or update a mission
 * Create a new mission or update the values of an active mission.
 *
 * If you pass the property `groupIds`, the mission will only be created for
 * these mission groups. Otherwise it will be visible in all groups that you
 * have write access to.
 *
 * Note that this operation completely replaces the state of the mission. Any
 * existing resources, actions or reports that are not present in the payload
 * will be removed from the mission. If you just want to update certain fields
 * of the mission, use `PATCH /missions/{missionId}` instead.
 *
 */
export const createMission = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionResponse,
    CreateMissionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Report an action taken on a mission
 */
export const createMissionAction = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionActionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionActionResponse,
    CreateMissionActionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/actions/{actionId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Add a report to a mission
 */
export const createMissionReport = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionReportData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionReportResponse,
    CreateMissionReportError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/reports/{reportId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Update the publication status of a report
 */
export const setMissionReportPublicationStatus = <
  ThrowOnError extends boolean = false,
>(
  options: Options<SetMissionReportPublicationStatusData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    SetMissionReportPublicationStatusResponse,
    SetMissionReportPublicationStatusError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/reports/{reportId}/publication/status",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Get a binary file
 */
export const getFile = <ThrowOnError extends boolean = false>(
  options: Options<GetFileData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetFileResponse,
    GetFileError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/files/{fileId}",
    ...options,
  });
};

/**
 * Request to upload a binary file.
 */
export const requestFileUpload = <ThrowOnError extends boolean = false>(
  options: Options<RequestFileUploadData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    RequestFileUploadResponse,
    RequestFileUploadError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/files/{fileId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Remove a resource from a mission
 */
export const removeMissionResource = <ThrowOnError extends boolean = false>(
  options: Options<RemoveMissionResourceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    RemoveMissionResourceResponse,
    RemoveMissionResourceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/resources/{resourceId}",
    ...options,
  });
};

/**
 * Update the state of a resource
 */
export const updateMissionResource = <ThrowOnError extends boolean = false>(
  options: Options<UpdateMissionResourceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<
    UpdateMissionResourceResponse,
    UpdateMissionResourceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/resources/{resourceId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Add a resource to a mission
 */
export const createMissionResource = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionResourceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionResourceResponse,
    CreateMissionResourceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/resources/{resourceId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Delete a map element for a mission.
 */
export const removeMissionMapElement = <ThrowOnError extends boolean = false>(
  options: Options<RemoveMissionMapElementData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    RemoveMissionMapElementResponse,
    RemoveMissionMapElementError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/map-elements/{elementId}",
    ...options,
  });
};

/**
 * Create a new map element for a mission.
 */
export const createMissionMapElement = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionMapElementData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionMapElementResponse,
    CreateMissionMapElementError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/map-elements/{elementId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Remove a section from a mission.
 */
export const removeMissionSection = <ThrowOnError extends boolean = false>(
  options: Options<RemoveMissionSectionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    RemoveMissionSectionResponse,
    RemoveMissionSectionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/sections/{sectionId}",
    ...options,
  });
};

/**
 * Update an existing section.
 */
export const updateMissionSection = <ThrowOnError extends boolean = false>(
  options: Options<UpdateMissionSectionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<
    UpdateMissionSectionResponse,
    UpdateMissionSectionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/sections/{sectionId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Create a new section for a mission.
 */
export const createMissionSection = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionSectionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionSectionResponse,
    CreateMissionSectionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/sections/{sectionId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Remove a patient from a mission.
 */
export const removeMissionPatient = <ThrowOnError extends boolean = false>(
  options: Options<RemoveMissionPatientData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    RemoveMissionPatientResponse,
    RemoveMissionPatientError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/patients/{patientId}",
    ...options,
  });
};

/**
 * Update an existing patient.
 */
export const updateMissionPatient = <ThrowOnError extends boolean = false>(
  options: Options<UpdateMissionPatientData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<
    UpdateMissionPatientResponse,
    UpdateMissionPatientError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/patients/{patientId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Register a new patient for a mission.
 */
export const createMissionPatient = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionPatientData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionPatientResponse,
    CreateMissionPatientError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/patients/{patientId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Remove a attendance from a mission.
 */
export const removeMissionAttendance = <ThrowOnError extends boolean = false>(
  options: Options<RemoveMissionAttendanceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    RemoveMissionAttendanceResponse,
    RemoveMissionAttendanceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/attendances/{attendanceId}",
    ...options,
  });
};

/**
 * Update an existing attendance.
 */
export const updateMissionAttendance = <ThrowOnError extends boolean = false>(
  options: Options<UpdateMissionAttendanceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<
    UpdateMissionAttendanceResponse,
    UpdateMissionAttendanceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/attendances/{attendanceId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Register a new attendance for a mission.
 */
export const createMissionAttendance = <ThrowOnError extends boolean = false>(
  options: Options<CreateMissionAttendanceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateMissionAttendanceResponse,
    CreateMissionAttendanceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/missions/{missionId}/attendances/{attendanceId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Create or update a resource across all missions.
 * The resource will be created or update across all missions that the API-Key has access to.
 *
 */
export const postMissionResource = <ThrowOnError extends boolean = false>(
  options: Options<PostMissionResourceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<
    PostMissionResourceResponse,
    PostMissionResourceError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/resources",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Get a list of all mission groups the current user has access to.
 */
export const getMissionGroups = <ThrowOnError extends boolean = false>(
  options?: Options<GetMissionGroupsData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<
    GetMissionGroupsResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/groups",
    ...options,
  });
};

/**
 * Create or update a mission group
 */
export const setMissionGroup = <ThrowOnError extends boolean = false>(
  options: Options<SetMissionGroupData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    SetMissionGroupResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/groups/{groupId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Get all active missions
 */
export const getGroupMissions = <ThrowOnError extends boolean = false>(
  options: Options<GetGroupMissionsData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetGroupMissionsResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/groups/{groupId}/missions",
    ...options,
  });
};

/**
 * Add a mission group to a mission.
 */
export const addMissionToGroup = <ThrowOnError extends boolean = false>(
  options: Options<AddMissionToGroupData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<
    AddMissionToGroupResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/groups/{groupId}/missions",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Search all available mission reports.
 */
export const searchReports = <ThrowOnError extends boolean = false>(
  options?: Options<SearchReportsData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<
    SearchReportsResponse,
    SearchReportsError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/reports",
    ...options,
  });
};

/**
 * Get the report for a closed mission.
 */
export const getReport = <ThrowOnError extends boolean = false>(
  options: Options<GetReportData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetReportResponse,
    GetReportError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/reports/{missionId}",
    ...options,
  });
};

/**
 * Create a new mission based on a closed mission.
 */
export const reopenMission = <ThrowOnError extends boolean = false>(
  options: Options<ReopenMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<
    ReopenMissionResponse,
    ReopenMissionError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/reports/{missionId}/reopen",
    ...options,
  });
};

/**
 * Get a binary file for a report
 */
export const getReportFile = <ThrowOnError extends boolean = false>(
  options: Options<GetReportFileData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetReportFileResponse,
    GetReportFileError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/reports/{missionId}/files/{fileId}",
    ...options,
  });
};

/**
 * Get user details
 */
export const getUser = <ThrowOnError extends boolean = false>(
  options?: Options<GetUserData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<
    GetUserResponse,
    GetUserError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/user",
    ...options,
  });
};

/**
 * Get Firebase configuration
 */
export const getFirebaseConfig = <ThrowOnError extends boolean = false>(
  options?: Options<GetFirebaseConfigData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<
    GetFirebaseConfigResponse,
    GetFirebaseConfigError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/firebase-config",
    ...options,
  });
};

/**
 * Search for users
 */
export const findUsers = <ThrowOnError extends boolean = false>(
  options?: Options<FindUsersData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<
    FindUsersResponse,
    FindUsersError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/users",
    ...options,
  });
};

/**
 * Delete a user
 */
export const deleteUser = <ThrowOnError extends boolean = false>(
  options: Options<DeleteUserData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    DeleteUserResponse,
    DeleteUserError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/users/{userId}",
    ...options,
  });
};

/**
 * Create or update a user
 */
export const createUser = <ThrowOnError extends boolean = false>(
  options: Options<CreateUserData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).put<
    CreateUserResponse,
    CreateUserError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/users/{userId}",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Get all API keys of a user
 */
export const getUserApiKeys = <ThrowOnError extends boolean = false>(
  options: Options<GetUserApiKeysData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetUserApiKeysResponse,
    GetUserApiKeysError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/users/{userId}/api-keys",
    ...options,
  });
};

/**
 * Create a new API key for a user
 */
export const createUserApiKey = <ThrowOnError extends boolean = false>(
  options: Options<CreateUserApiKeyData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<
    CreateUserApiKeyResponse,
    CreateUserApiKeyError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/users/{userId}/api-keys",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Delete an API key of a user
 */
export const deleteUserApiKey = <ThrowOnError extends boolean = false>(
  options: Options<DeleteUserApiKeyData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<
    DeleteUserApiKeyResponse,
    DeleteUserApiKeyError,
    ThrowOnError
  >({
    security: [
      {
        name: "authorization",
        type: "apiKey",
      },
    ],
    url: "/users/{userId}/api-keys/{apiKeyId}",
    ...options,
  });
};

/**
 * Create or update a mission
 * The preferred method to create or update missions is `PUT /missions/{id}`.
 * If your architecture does not allow you to maintain a mapping between
 * your system's mission IDs and those from this API, you can use the `POST`
 * method instead. If your system is not capable of sending anything else but
 * `GET` requests, this method is your last resort. It allows you to create
 * and update missions with basic information using `GET` requests.
 *
 * You need to pass your API key as the query parameter `apiKey` with every
 * request.
 *
 * You cannot create or update mission actions, reports or resources with this
 * method.
 *
 * We identify missions with the combination of your API key and the query
 * parameter `externalId`. The mapping will be kept for at least 24 hours after
 * the last update to the mission.
 *
 * **Note:** Using a GET method to mutate data is a _very_ dirty hack that we only
 * provide for integration with systems that don't allow configuration of more
 * diverse HTTP verbs or request headers. It comes with many problems and caveats
 * and must only used as a last resort. You have been warned.
 *
 */
export const getPutMission = <ThrowOnError extends boolean = false>(
  options: Options<GetPutMissionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetPutMissionResponse,
    GetPutMissionError,
    ThrowOnError
  >({
    security: [
      {
        in: "query",
        name: "apiKey",
        type: "apiKey",
      },
    ],
    url: "/get/put-mission",
    ...options,
  });
};

/**
 * Update the details of a resource
 * The preferred method to create or update resource is `PUT /missions/{missionId}/resource/{resourceId}`
 * or `POST /resources`. If your system is not capable of sending anything else but
 * `GET` requests, this method is your last resort. It allows you to update
 * resources with basic information using `GET` requests.
 *
 * You need to pass your API key as the query parameter `apiKey` with every
 * request.
 *
 * You cannot create new resources with this method.
 *
 * **Note:** Using a GET method to mutate data is a _very_ dirty hack that we only
 * provide for integration with systems that don't allow configuration of more
 * diverse HTTP verbs or request headers. It comes with many problems and caveats
 * and must only used as a last resort. You have been warned.
 *
 */
export const getUpdateResource = <ThrowOnError extends boolean = false>(
  options: Options<GetUpdateResourceData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    unknown,
    GetUpdateResourceError,
    ThrowOnError
  >({
    security: [
      {
        in: "query",
        name: "apiKey",
        type: "apiKey",
      },
    ],
    url: "/get/update-resource",
    ...options,
  });
};

/**
 * Get translations for a language
 */
export const getTranslations = <ThrowOnError extends boolean = false>(
  options: Options<GetTranslationsData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<
    GetTranslationsResponse,
    unknown,
    ThrowOnError
  >({
    url: "/i18n/{language}",
    ...options,
  });
};
