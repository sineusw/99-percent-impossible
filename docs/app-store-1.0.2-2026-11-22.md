# App Store 1.0.2 submission

Owner explicitly requested pushing the approved updates to the App Store on November 22, 2026. This supersedes earlier beta-only delivery scope. The public website/main branch was not changed as an incidental side effect.

## Candidate and verification

Production source eb5d5acde67a6b92f33247574740d03f6221c4c9 includes the latest beta feature stack, including all Home and leaderboard visual refinements, live Game Center scoring/cast reactions, daily skill goals and existing native Apple products. Upload workflow45070835122 succeeded, producing 1.0.2 (450708351221). Downloaded IPA14772927483 was independently inspected: latest three Home/board assets exactly match source; production AdMob real-unit configuration is present, test devices empty, sample rank mode disabled, exact marketing version/build verified. This is a new production-configured binary, not the prior Google-test-ad beta.

Account inspection45070727884 confirmed live1.0.1 build436868618131, all six existing IAPs APPROVED with availability and pricing. Public app-ads.txt is accessible and contains the exact publisher record. AdMob account approval itself was not read; no claim is made that ads will fill. Earlier native iPhone/iPad layout and commerce checks remain documented per build; no new physical-device purchase/restore, cross-account Game Center or production-ad QA result is invented. Owner approved the tested visual design and explicitly requested App Store submission.

## Apple preparation

Existing Apple API secrets remain in Actions; no chat credentials used or disclosed. Added an explicit existing-workflow operation for inspect/prepare/submit. Apple build-processing wait was required. An initial Game Center create request rejected enabled as a create attribute; corrected to create the relationship then PATCH enabled. No unrelated app/products/legal agreements/prices were changed.

Preparation45071520642 succeeded: appStoreVersion6cfc0fe3-62fc-4bfd-a693-ca83ddad9991, state PREPARE_FOR_SUBMISSION, exact production build attached, copyright/listing/support/marketing/contact preserved, new English release notes and truthful review notes set. Existing screenshot sets automatically inherited: iPhone65 six, iPhone61 six, iPad129 seven; these were retained rather than replacing them with QA-fixture images.

Game Center enabled for the candidate. Three actual production leaderboard releases created: Timer f8a8aacf-8b8e-415f-bd54-704b80df84ca; Stop144eabf4-35c8-4c66-a874-e394c88492b8; Reaction7b675b48-59a8-4d68-b409-44637dd9c66e. Score rules and board identifiers preserved.

Release type AFTER_APPROVAL matches the existing live version and the owner's request to publish. Submission succeeded: workflow45071607094, job137359581557, review submission af1376a1-d9e1-42dc-8383-b9ce675206dc. Apple confirms versionState WAITING_FOR_REVIEW for1.0.2 build450708351221. Automatic release AFTER_APPROVAL is configured. The update is not yet approved or publicly live; existing1.0.1 remains the live release until Apple completes review. Draft PR43 records the release tooling and references the feature stack; no main merge needed to upload/submit.
