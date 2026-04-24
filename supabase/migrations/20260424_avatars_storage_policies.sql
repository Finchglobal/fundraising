-- Allow authenticated users to upload their own avatar (path: {user_id}/avatar.*)
CREATE POLICY "avatars_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update/replace their own avatar
CREATE POLICY "avatars_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own avatar
CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to read avatars (public bucket)
CREATE POLICY "avatars_select"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
