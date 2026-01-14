# TODO: Fix Login and Profile Submission Issues

## Issue 1: Email Verification Redirect
- [x] Modify Login.tsx to check email verification status after successful login
- [x] Redirect to /verify-email if email is not verified instead of home page

## Issue 2: File Upload Timing
- [x] Change SubmitProfile.tsx to upload photo during form submission, not on file selection
- [x] Store selected file in state and upload only when submitting
- [x] Handle upload errors during submission and allow retry

## Issue 3: Upload URL Issue
- [x] Investigate why upload URL is resolving to production URL instead of local
- [x] Fix URL resolution in use-upload.ts hook (updated getUploadParameters to use window.location.origin)
