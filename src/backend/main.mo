import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat64 "mo:core/Nat64";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int64 "mo:core/Int64";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

actor {
  type AlumniProfile = {
    fullName : Text;
    graduationYear : Nat16;
    department : Text;
    currentCity : Text;
    currentCountry : Text;
    bio : Text;
    contactInfo : ?Text;
  };

  type EditableEvent = {
    title : Text;
    timestampNanos : Nat64;
    location : Text;
    description : Text;
  };

  type Event = {
    id : Nat64;
    title : Text;
    timestampNanos : Nat64;
    location : Text;
    description : Text;
  };

  type EditableAnnouncement = {
    title : Text;
    content : Text;
  };

  type Announcement = {
    id : Nat64;
    title : Text;
    timestampNanos : Int;
    content : Text;
  };

  type GalleryImage = {
    id : Nat64;
    imageUrl : Text;
    title : Text;
    description : Text;
    timestampNanos : Int;
  };

  type EditableGalleryImage = {
    imageUrl : Text;
    title : Text;
    description : Text;
  };

  type Activity = {
    id : Nat64;
    title : Text;
    description : Text;
    timestampNanos : Int;
    photos : [Text];
  };

  type EditableActivity = {
    title : Text;
    description : Text;
    photos : [Text];
  };

  type DirectoryEntry = (Nat16, Text);

  public type BackendStatus = {
    totalAlumniProfiles : Nat;
    totalEvents : Nat;
    totalAnnouncements : Nat;
    totalGalleryImages : Nat;
    totalActivities : Nat;
    totalApprovedUsers : Nat;
    totalPendingUsers : Nat;
  };

  module Event {
    public func compare(a : Event, b : Event) : Order.Order {
      Nat64.compare(a.id, b.id);
    };
  };

  module Announcement {
    public func compare(a : Announcement, b : Announcement) : Order.Order {
      Nat64.compare(a.id, b.id);
    };
  };

  module GalleryImage {
    public func compare(a : GalleryImage, b : GalleryImage) : Order.Order {
      Nat64.compare(a.id, b.id);
    };
  };

  module Activity {
    public func compare(a : Activity, b : Activity) : Order.Order {
      Nat64.compare(a.id, b.id);
    };
  };

  type BackendSnapshot = {
    id : Nat;
    capturedAt : Int;
    totalAlumniProfiles : Nat;
    totalEvents : Nat;
    totalAnnouncements : Nat;
    totalGalleryImages : Nat;
    totalActivities : Nat;
    totalApprovedUsers : Nat;
    totalPendingUsers : Nat;
  };

  // --- Persistent State ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  let alumniProfiles = Map.empty<Principal, AlumniProfile>();
  let eventEntries = Map.empty<Nat64, Event>();
  let announcementEntries = Map.empty<Nat64, Announcement>();
  let galleryImages = Map.empty<Nat64, GalleryImage>();
  let activities = Map.empty<Nat64, Activity>();

  var nextEventId = 0 : Nat64;
  var nextAnnouncementId = 0 : Nat64;
  var nextGalleryImageId = 0 : Nat64;
  var nextActivityId = 0 : Nat64;

  var nextSnapshotId = 0;
  let backendSnapshots = Map.empty<Nat, BackendSnapshot>();

  func extractDirectoryEntry(profile : AlumniProfile) : DirectoryEntry {
    (profile.graduationYear, profile.department);
  };

  func isCallerApprovedOrAdmin(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  // --- Guard Functions ---
  func adminGuard(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
  };

  func userGuard(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Users only");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Approvals only");
    };
  };

  // --- Auth/Approval API ---
  public query ({ caller }) func isCallerApproved() : async Bool {
    isCallerApprovedOrAdmin(caller);
  };

  // --- Profile Functions ---
  public query ({ caller }) func getCallerUserProfile() : async ?AlumniProfile {
    userGuard(caller);
    alumniProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?AlumniProfile {
    userGuard(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    alumniProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : AlumniProfile) : async () {
    userGuard(caller);
    alumniProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveAlumniProfile(profile : AlumniProfile) : async () {
    userGuard(caller);
    alumniProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAlumniProfile(user : Principal) : async ?AlumniProfile {
    userGuard(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    alumniProfiles.get(user);
  };

  public query ({ caller }) func getGraduationYears() : async [Nat16] {
    userGuard(caller);
    let yearsSet = Set.empty<Nat16>();
    for ((_, profile) in alumniProfiles.entries()) {
      yearsSet.add(profile.graduationYear);
    };
    yearsSet.toArray();
  };

  public query ({ caller }) func getDepartments() : async [Text] {
    userGuard(caller);
    let departmentSet = Set.empty<Text>();
    for ((_, profile) in alumniProfiles.entries()) {
      departmentSet.add(profile.department);
    };
    departmentSet.toArray();
  };

  public query ({ caller }) func searchAlumniProfiles(filterYear : ?Nat16, filterDepartment : ?Text) : async [AlumniProfile] {
    userGuard(caller);
    let filteredProfiles = alumniProfiles.values().toArray().filter(
      func(profile) {
        let yearMatch = switch (filterYear) {
          case (null) { true };
          case (?filter) { profile.graduationYear == filter };
        };

        let deptMatch = switch (filterDepartment) {
          case (null) { true };
          case (?filter) { profile.department == filter };
        };

        yearMatch and deptMatch;
      }
    );
    filteredProfiles;
  };

  // --- Event Management ---
  public shared ({ caller }) func createEvent(event : EditableEvent) : async () {
    adminGuard(caller);
    let curId = nextEventId;
    let newEvent : Event = {
      id = curId;
      title = event.title;
      timestampNanos = event.timestampNanos;
      location = event.location;
      description = event.description;
    };
    eventEntries.add(curId, newEvent);
    nextEventId += 1;
  };

  public shared ({ caller }) func updateEvent(id : Nat64, updatedEvent : EditableEvent) : async () {
    adminGuard(caller);
    switch (eventEntries.get(id)) {
      case (null) {
        Runtime.trap("Event does not exist");
      };
      case (?existingEvent) {
        let updated : Event = {
          id;
          title = updatedEvent.title;
          timestampNanos = updatedEvent.timestampNanos;
          location = updatedEvent.location;
          description = updatedEvent.description;
        };
        eventEntries.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteEvent(id : Nat64) : async () {
    adminGuard(caller);
    switch (eventEntries.get(id)) {
      case (null) {
        Runtime.trap("Event does not exist");
      };
      case (?_) {
        eventEntries.remove(id);
      };
    };
  };

  public query ({ caller }) func getEvents(byPast : ?Bool) : async [Event] {
    userGuard(caller);
    let allEvents = eventEntries.values().toArray();
    switch (byPast) {
      case (null) { allEvents };
      case (?true) {
        allEvents.filter(func(event) { event.timestampNanos.toNat() < Time.now() });
      };
      case (?false) {
        allEvents.filter(func(event) { event.timestampNanos.toNat() >= Time.now() });
      };
    };
  };

  // --- Announcement Management ---
  public shared ({ caller }) func createAnnouncement(announcement : EditableAnnouncement) : async () {
    adminGuard(caller);
    let curId = nextAnnouncementId;
    let newAnnouncement : Announcement = {
      id = curId;
      title = announcement.title;
      timestampNanos = Time.now();
      content = announcement.content;
    };
    announcementEntries.add(curId, newAnnouncement);
    nextAnnouncementId += 1;
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat64) : async () {
    adminGuard(caller);
    switch (announcementEntries.get(id)) {
      case (null) {
        Runtime.trap("Announcement does not exist");
      };
      case (?_) {
        announcementEntries.remove(id);
      };
    };
  };

  public query ({ caller }) func getAnnouncements() : async [Announcement] {
    userGuard(caller);
    announcementEntries.values().toArray();
  };

  private func filterByDateRange(announcements : [Announcement], start : ?Int, end : ?Int) : [Announcement] {
    announcements.filter(
      func(announcement) {
        let isAfterStart = switch (start) {
          case (null) { true };
          case (?startNs) { announcement.timestampNanos >= startNs };
        };

        let isBeforeEnd = switch (end) {
          case (null) { true };
          case (?endNs) { announcement.timestampNanos < endNs };
        };

        isAfterStart and isBeforeEnd;
      }
    );
  };

  public query ({ caller }) func getAnnouncementsByYearRange(startYear : ?Int16, endYear : ?Int16) : async [Announcement] {
    userGuard(caller);
    let allAnnouncements = announcementEntries.values().toArray();
    let allFiltered = filterByDateRange(
      allAnnouncements,
      null,
      null,
    );
    allFiltered;
  };

  // --- Gallery Management ---
  public shared ({ caller }) func createGalleryImage(image : EditableGalleryImage) : async () {
    adminGuard(caller);
    let curId = nextGalleryImageId;
    let newImage : GalleryImage = {
      id = curId;
      imageUrl = image.imageUrl;
      title = image.title;
      description = image.description;
      timestampNanos = Time.now();
    };
    galleryImages.add(curId, newImage);
    nextGalleryImageId += 1;
  };

  public shared ({ caller }) func updateGalleryImage(id : Nat64, updatedImage : EditableGalleryImage) : async () {
    adminGuard(caller);
    switch (galleryImages.get(id)) {
      case (null) {
        Runtime.trap("Gallery image does not exist");
      };
      case (?existingImage) {
        let updated : GalleryImage = {
          id;
          imageUrl = updatedImage.imageUrl;
          title = updatedImage.title;
          description = updatedImage.description;
          timestampNanos = existingImage.timestampNanos;
        };
        galleryImages.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteGalleryImage(id : Nat64) : async () {
    adminGuard(caller);
    switch (galleryImages.get(id)) {
      case (null) {
        Runtime.trap("Gallery image does not exist");
      };
      case (?_) {
        galleryImages.remove(id);
      };
    };
  };

  public query ({ caller }) func getGalleryImages() : async [GalleryImage] {
    userGuard(caller);
    galleryImages.values().toArray();
  };

  // --- Activities Management ---
  public shared ({ caller }) func createActivity(activity : EditableActivity) : async () {
    adminGuard(caller);
    let curId = nextActivityId;
    let newActivity : Activity = {
      id = curId;
      title = activity.title;
      description = activity.description;
      timestampNanos = Time.now();
      photos = activity.photos;
    };
    activities.add(curId, newActivity);
    nextActivityId += 1;
  };

  public shared ({ caller }) func updateActivity(id : Nat64, updatedActivity : EditableActivity) : async () {
    adminGuard(caller);
    switch (activities.get(id)) {
      case (null) {
        Runtime.trap("Activity does not exist");
      };
      case (?existingActivity) {
        let updated : Activity = {
          id;
          title = updatedActivity.title;
          description = updatedActivity.description;
          timestampNanos = existingActivity.timestampNanos;
          photos = updatedActivity.photos;
        };
        activities.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteActivity(id : Nat64) : async () {
    adminGuard(caller);
    switch (activities.get(id)) {
      case (null) {
        Runtime.trap("Activity does not exist");
      };
      case (?_) {
        activities.remove(id);
      };
    };
  };

  public query ({ caller }) func getActivities() : async [Activity] {
    userGuard(caller);
    activities.values().toArray();
  };

  // --- Approval API ---
  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    adminGuard(caller);
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovalStates() : async [(Principal, UserApproval.ApprovalStatus)] {
    adminGuard(caller);
    let approvals : [(Principal, UserApproval.ApprovalStatus)] = UserApproval.listApprovals(approvalState).map(
      func(info) { (info.principal, info.status) }
    );
    approvals;
  };

  public query ({ caller }) func listApprovalStatesWithProfiles() : async [(Principal, UserApproval.ApprovalStatus, ?AlumniProfile)] {
    adminGuard(caller);
    UserApproval.listApprovals(approvalState).map(
      func(info) {
        (info.principal, info.status, alumniProfiles.get(info.principal));
      }
    );
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    adminGuard(caller);
    UserApproval.listApprovals(approvalState);
  };

  // --- Backend Diagnostics API (Admin Only) ---
  public query ({ caller }) func getBackendStatus() : async BackendStatus {
    adminGuard(caller);
    {
      totalAlumniProfiles = alumniProfiles.size();
      totalEvents = eventEntries.size();
      totalAnnouncements = announcementEntries.size();
      totalGalleryImages = galleryImages.size();
      totalActivities = activities.size();
      totalApprovedUsers = countApprovedUsers();
      totalPendingUsers = countPendingUsers();
    };
  };

  // Backend status snapshot functions
  public shared ({ caller }) func createBackendSnapshot() : async Nat {
    adminGuard(caller);
    let snapshotId = nextSnapshotId;
    nextSnapshotId += 1;

    let snapshot : BackendSnapshot = {
      id = snapshotId;
      capturedAt = Time.now();
      totalAlumniProfiles = alumniProfiles.size();
      totalEvents = eventEntries.size();
      totalAnnouncements = announcementEntries.size();
      totalGalleryImages = galleryImages.size();
      totalActivities = activities.size();
      totalApprovedUsers = countApprovedUsers();
      totalPendingUsers = countPendingUsers();
    };

    backendSnapshots.add(snapshotId, snapshot);
    snapshotId;
  };

  public query ({ caller }) func listBackendSnapshots() : async [BackendSnapshot] {
    adminGuard(caller);
    backendSnapshots.values().toArray().reverse();
  };

  public shared ({ caller }) func deleteBackendSnapshot(id : Nat) : async Bool {
    adminGuard(caller);
    switch (backendSnapshots.get(id)) {
      case (null) { false };
      case (?_) {
        backendSnapshots.remove(id);
        true;
      };
    };
  };

  public shared ({ caller }) func clearAllBackendSnapshots() : async () {
    adminGuard(caller);
    backendSnapshots.clear();
  };

  private func countApprovedUsers() : Nat {
    var count = 0;
    for (user in UserApproval.listApprovals(approvalState).values()) {
      switch (user.status) {
        case (#approved) { count += 1 };
        case (_) {};
      };
    };
    count;
  };

  private func countPendingUsers() : Nat {
    var count = 0;
    for (user in UserApproval.listApprovals(approvalState).values()) {
      switch (user.status) {
        case (#pending) { count += 1 };
        case (_) {};
      };
    };
    count;
  };
};
