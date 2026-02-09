import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat64 "mo:core/Nat64";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

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

  // Gallery and Acts & Activities types
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

  let alumniProfiles = Map.empty<Principal, AlumniProfile>();
  let eventEntries = Map.empty<Nat64, Event>();
  let announcementEntries = Map.empty<Nat64, Announcement>();
  let galleryImages = Map.empty<Nat64, GalleryImage>();
  let activities = Map.empty<Nat64, Activity>();

  var nextEventId = 0 : Nat64;
  var nextAnnouncementId = 0 : Nat64;
  var nextGalleryImageId = 0 : Nat64;
  var nextActivityId = 0 : Nat64;

  func extractDirectoryEntry(profile : AlumniProfile) : (Nat16, Text) {
    (profile.graduationYear, profile.department);
  };

  // Helper function to check if caller is approved (admin or approved user)
  func isCallerApprovedOrAdmin(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    isCallerApprovedOrAdmin(caller);
  };

  // Profile functions - require user role AND approval (or admin)
  public query ({ caller }) func getCallerUserProfile() : async ?AlumniProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access profiles");
    };
    alumniProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?AlumniProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    alumniProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : AlumniProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to save profiles");
    };
    alumniProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveAlumniProfile(profile : AlumniProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to save profiles");
    };
    alumniProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAlumniProfile(user : Principal) : async ?AlumniProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    alumniProfiles.get(user);
  };

  // Directory functions - require user role AND approval (or admin)
  public query ({ caller }) func getGraduationYears() : async [Nat16] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access directory");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access directory");
    };
    let yearsSet = Set.empty<Nat16>();

    for ((_, profile) in alumniProfiles.entries()) {
      yearsSet.add(profile.graduationYear);
    };

    yearsSet.toArray();
  };

  public query ({ caller }) func getDepartments() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access directory");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access directory");
    };
    let departmentSet = Set.empty<Text>();

    for ((_, profile) in alumniProfiles.entries()) {
      departmentSet.add(profile.department);
    };

    departmentSet.toArray();
  };

  public query ({ caller }) func searchAlumniProfiles(filterYear : ?Nat16, filterDepartment : ?Text) : async [AlumniProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search directory");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to search directory");
    };
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

  // Event management - admin only for create/update/delete
  public shared ({ caller }) func createEvent(event : EditableEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (eventEntries.get(id)) {
      case (null) {
        Runtime.trap("Event does not exist");
      };
      case (?_) {
        eventEntries.remove(id);
      };
    };
  };

  // Event viewing - require user role AND approval (or admin)
  public query ({ caller }) func getEvents(byPast : ?Bool) : async [Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to view events");
    };
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

  // Announcement management - admin only for create/delete
  public shared ({ caller }) func createAnnouncement(announcement : EditableAnnouncement) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (announcementEntries.get(id)) {
      case (null) {
        Runtime.trap("Announcement does not exist");
      };
      case (?_) {
        announcementEntries.remove(id);
      };
    };
  };

  // Announcement viewing - require user role AND approval (or admin)
  public query ({ caller }) func getAnnouncements() : async [Announcement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view announcements");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to view announcements");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view announcements");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to view announcements");
    };
    let allAnnouncements = announcementEntries.values().toArray();

    let allFiltered = filterByDateRange(
      allAnnouncements,
      null,
      null,
    );

    allFiltered;
  };

  // Gallery management - admin only for create/update/delete
  public shared ({ caller }) func createGalleryImage(image : EditableGalleryImage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gallery images");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to view gallery images");
    };
    galleryImages.values().toArray();
  };

  // Acts & Activities management - admin only for create/update/delete
  public shared ({ caller }) func createActivity(activity : EditableActivity) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    if (not isCallerApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: User must be approved to view activities");
    };
    activities.values().toArray();
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  // Approval API: only returns approval state now
  public query ({ caller }) func listApprovalStates() : async [(Principal, UserApproval.ApprovalStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let approvals : [(Principal, UserApproval.ApprovalStatus)] = UserApproval.listApprovals(approvalState).map(
      func(info) { (info.principal, info.status) }
    );
    approvals;
  };

  public query ({ caller }) func listApprovalStatesWithProfiles() : async [(Principal, UserApproval.ApprovalStatus, ?AlumniProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    UserApproval.listApprovals(approvalState).map(
      func(info) {
        (info.principal, info.status, alumniProfiles.get(info.principal));
      }
    );
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};
