import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GraduationCap, Clock, MapPin, Users } from 'lucide-react';
import { useUserContext } from '../UserEnvProvider';
import { Button } from '@/components/ui/button';

interface GroupProps {
  courseId: string;
}

interface GroupData {
  group_id: string;
  course_id: string;
  users: string[];
  user_info: any[];
}

export default function Group({ courseId }: GroupProps) {
  const { token, userId, myGroups } = useUserContext();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);

  // Fetch all groups for the course
  useEffect(() => {
    console.log(myGroups);
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await response.json();
        setGroups(data.groups || []);
      } catch (err) {
        setError('Error fetching groups');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchGroups();
  }, [courseId, token]);

  // Join a group
  const handleJoin = async (groupId: string) => {
    if (!userId) return;
    setJoining(groupId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group/${groupId}/user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to join group');
      console.log(await response.json());
      // Refresh groups
      setGroups(groups => groups.map(g => g.group_id === groupId ? { ...g, users: [...g.users, userId] } : g));
    } catch (err) {
      setError('Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  // Leave a group
  const handleLeave = async (groupId: string) => {
    if (!userId) return;
    setLeaving(groupId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group/${groupId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to leave group');
      // Refresh groups
      setGroups(groups => groups.map(g => g.group_id === groupId ? { ...g, users: g.users.filter(u => u !== userId) } : g));
    } catch (err) {
      setError('Failed to leave group');
    } finally {
      setLeaving(null);
    }
  };

  // Find the group the user is in, if any
  const userGroup = groups.find(group => userId && group.users.includes(userId));

  // Determine which groups to display
  const groupsToDisplay = userGroup ? [userGroup] : groups;

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {groupsToDisplay.length === 0 && <div className="m-4">This course has no groups.</div>}
      {groupsToDisplay.map(group => {
        const isMember = userId && group.users.includes(userId);
        return (
          <Card key={group.group_id} className="flex flex-col m-4">
            <CardHeader>
              <CardTitle>Group #{group.group_id.slice(0, 4)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 mr-1" />
                <span>Members: {group.user_info.length}</span>
                {group.user_info.map((user: any) => (
                  <Avatar key={user.user_id} className="w-8 h-8" title={user.name}>
                    <AvatarFallback title={user.name}>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="mt-4">
                {isMember ? (
                  <Button
                    className="bg-red-300"
                    onClick={() => handleLeave(group.group_id)}
                    disabled={leaving === group.group_id}
                  >
                    {leaving === group.group_id ? 'Leaving...' : 'Leave Group'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleJoin(group.group_id)}
                    disabled={joining === group.group_id}
                  >
                    {joining === group.group_id ? 'Joining...' : 'Join Group'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}