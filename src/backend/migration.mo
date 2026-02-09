import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Principal "mo:core/Principal";

module {
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

  type Activity = {
    id : Nat64;
    title : Text;
    description : Text;
    timestampNanos : Int;
    photos : [Text];
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    alumniProfiles : Map.Map<Principal, AlumniProfile>;
    eventEntries : Map.Map<Nat64, Event>;
    announcementEntries : Map.Map<Nat64, Announcement>;
    nextEventId : Nat64;
    nextAnnouncementId : Nat64;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    alumniProfiles : Map.Map<Principal, AlumniProfile>;
    eventEntries : Map.Map<Nat64, Event>;
    announcementEntries : Map.Map<Nat64, Announcement>;
    galleryImages : Map.Map<Nat64, GalleryImage>;
    activities : Map.Map<Nat64, Activity>;
    nextEventId : Nat64;
    nextAnnouncementId : Nat64;
    nextGalleryImageId : Nat64;
    nextActivityId : Nat64;
  };

  public func run(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      approvalState = old.approvalState;
      alumniProfiles = old.alumniProfiles;
      eventEntries = old.eventEntries;
      announcementEntries = old.announcementEntries;
      galleryImages = Map.empty<Nat64, GalleryImage>();
      activities = Map.empty<Nat64, Activity>();
      nextEventId = old.nextEventId;
      nextAnnouncementId = old.nextAnnouncementId;
      nextGalleryImageId = 0;
      nextActivityId = 0;
    };
  };
};
