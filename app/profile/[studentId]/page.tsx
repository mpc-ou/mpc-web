import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface ProfilePageProps {
  params: Promise<{ studentId: string }>;
}

async function getProfileData(studentId: string) {
  const supabase = await createClient();
  
  // Thử lấy data từ Supabase
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("student_id", studentId)
    .single();

  if (member) {
    return {
      id: member.student_id,
      name: member.name || `Thành viên ${studentId}`,
      email: member.email || `${studentId}@student.university.edu.vn`,
      role: member.role || "Thành viên",
      avatar: member.avatar_url,
      bio: member.bio || "Đây là trang profile mặc định. Thành viên có thể tự thiết kế trang của mình.",
      hasCustomProfile: member.has_custom_profile || false,
      // Pass through all member data for custom profiles
      ...member,
    };
  }

  return {
    id: studentId,
    name: `Thành viên ${studentId}`,
    email: `${studentId}@student.university.edu.vn`,
    role: "Thành viên",
    avatar: null,
    bio: "Đây là trang profile mặc định. Thành viên có thể tự thiết kế trang của mình.",
    hasCustomProfile: false,
    student_id: studentId,
  };
}

async function getCustomProfileComponent(studentId: string) {
  try {
    // Try to dynamically import custom profile component
    // Format: app/profile/custom/{studentId}.tsx
    // Note: File must exist at build time for this to work
    const CustomProfile = await import(`@/app/profile/custom/${studentId}`);
    return CustomProfile.default;
  } catch (error) {
    // Custom profile not found - this is expected if file doesn't exist
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { studentId } = await params;
  const profile = await getProfileData(studentId);

  if (!profile) {
    notFound();
  }

  // Try to load custom profile component
  const CustomProfileComponent = await getCustomProfileComponent(studentId);

  // If custom profile exists, render it
  if (CustomProfileComponent) {
    return <CustomProfileComponent profile={profile} />;
  }

  // Otherwise, render default profile
  // Note: Temporarily disabled suggestion message
  const showSuggestion = false;

  return (
    <div className="container mx-auto px-4 py-36">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-[var(--muted)] flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-[var(--text-tertiary)]" />
                )}
              </div>
              <div>
                <CardTitle className="text-3xl mb-2">{profile.name}</CardTitle>
                <p className="text-[var(--text-secondary)]">{profile.role}</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Mã số sinh viên: {profile.id}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-[var(--text-primary)]">
                Giới thiệu
              </h3>
              <p className="text-[var(--text-secondary)]">{profile.bio}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-[var(--text-primary)]">
                Thông tin liên hệ
              </h3>
              <p className="text-[var(--text-secondary)]">{profile.email}</p>
            </div>
            {showSuggestion && (
              <div className="p-4 rounded-lg bg-[var(--info-light)] border border-[var(--info)]">
                <p className="text-sm text-[var(--text-secondary)]">
                  💡 <strong>Gợi ý:</strong> Bạn có thể tự thiết kế trang profile của mình 
                  bằng cách tạo file tại{" "}
                  <code className="bg-[var(--bg-primary)] px-2 py-1 rounded">
                    app/profile/custom/{studentId}.tsx
                  </code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
