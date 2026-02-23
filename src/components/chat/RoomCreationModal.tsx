import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChatStore } from '@/lib/store';
import { toast } from 'sonner';
const schema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters'),
  type: z.enum(['public', 'private']),
});
interface RoomCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function RoomCreationModal({ open, onOpenChange }: RoomCreationModalProps) {
  const createRoom = useChatStore((s) => s.createRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'public' }
  });
  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const room = await createRoom(values.name, values.type);
      toast.success('Room Created', { description: `#${values.name} is ready for speed.` });
      setActiveRoom(room.id);
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error('Failed to create room');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/5 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">New Channel</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a space for your team to communicate at edge speeds.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Channel Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. design-ops"
              className="bg-slate-800 border-white/10 text-white"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Privacy</Label>
            <div className="flex gap-4">
              <label className="flex-1 p-3 rounded-xl border border-white/5 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="radio" {...register('type')} value="public" className="mr-2" />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex-1 p-3 rounded-xl border border-white/5 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="radio" {...register('type')} value="private" className="mr-2" />
                <span className="text-sm">Private</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}