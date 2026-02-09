import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat64 "mo:core/Nat64";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  let alumniProfiles = Map.empty<Principal, AlumniProfile>();
  let eventEntries = Map.empty<Nat64, Event>();
  let announcementEntries = Map.empty<Nat64, Announcement>();

  var nextEventId = 0 : Nat64;
  var nextAnnouncementId = 0 : Nat64;

  func extractDirectoryEntry(profile : AlumniProfile) : (Nat16, Text) {
    (profile.graduationYear, profile.department);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?AlumniProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    alumniProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?AlumniProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    alumniProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : AlumniProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    alumniProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveAlumniProfile(profile : AlumniProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    alumniProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAlumniProfile(user : Principal) : async ?AlumniProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    alumniProfiles.get(user);
  };

  public query ({ caller }) func getGraduationYears() : async [Nat16] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access directory");
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

  public query ({ caller }) func getEvents(byPast : ?Bool) : async [Event] {
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

  public query ({ caller }) func getAnnouncements() : async [Announcement] {
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
    let allAnnouncements = announcementEntries.values().toArray();

    let allFiltered = filterByDateRange(
      allAnnouncements,
      null,
      null,
    );

    allFiltered;
  };
};
