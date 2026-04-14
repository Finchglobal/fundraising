"use client"

import { useState, useCallback, useMemo } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { GripVertical, Plus, Trash2, Film, Image as ImageIcon, Video, Play, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useLang } from "@/components/LanguageSwitcher"

export type MediaType = 'image' | 'video' | 'reel' | 'short'

export interface MediaItem {
  id: string
  type: MediaType
  url: string
}

interface MediaManagerProps {
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
}

export function MediaManager({ media, onChange }: MediaManagerProps) {
  const { t } = useLang()
  const [newUrl, setNewUrl] = useState("")
  
  const categories = useMemo(() => [
    { value: 'image', label: t("media_type_images"), icon: ImageIcon, color: 'text-blue-500' },
    { value: 'video', label: t("media_type_videos"), icon: Video, color: 'text-teal-500' },
    { value: 'reel', label: t("media_type_reels"), icon: Film, color: 'text-pink-500' },
    { value: 'short', label: t("media_type_shorts"), icon: Play, color: 'text-red-500' },
  ] as const, [t])

  const autoDetectType = (url: string): MediaType => {
    if (url.includes('youtube.com/shorts') || url.includes('youtu.be/shorts')) return 'short'
    if (url.includes('youtube.com/reel') || url.includes('instagram.com/reels')) return 'reel'
    if (url.match(/\.(jpeg|jpg|gif|png|webp)/i)) return 'image'
    return 'video'
  }

  const handleAdd = () => {
    if (!newUrl) return
    
    // Simple validation
    if (!newUrl.startsWith('http')) {
      toast.error("Invalid URL", { description: "Please enter a valid link." })
      return
    }

    const type = autoDetectType(newUrl)
    const newItem: MediaItem = {
      id: Math.random().toString(36).substring(7),
      type: type,
      url: newUrl
    }

    onChange([...media, newItem])
    setNewUrl("")
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to gallery`)
  }

  const handleRemove = (id: string) => {
    onChange(media.filter(item => item.id !== id))
    toast.info("Media item removed")
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(media)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onChange(items)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("media_add_title")}
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Input 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={t("media_input_placeholder")}
              className="bg-white pl-4 pr-20 h-11"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            />
            <div className="absolute right-3 top-3.5">
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{t("media_auto_detect")}</span>
            </div>
          </div>
          <Button 
            type="button"
            onClick={handleAdd}
            className="h-11 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95"
          >
            {t("media_btn_add")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
           {categories.map(cat => (
             <div key={cat.value} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm hover:border-slate-200 transition-colors">
                <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{cat.label}</span>
             </div>
           ))}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="media-gallery">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-3"
            >
              {media.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Film className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">{t("media_empty_title")}</p>
                  <p className="text-[11px] text-slate-400 font-medium px-4">{t("media_empty_desc")}</p>
                </div>
              ) : (
                media.map((item, index) => {
                  const Category = categories.find(c => c.value === item.type) || categories[1]
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 bg-white border rounded-xl p-3 group transition-all ${
                            snapshot.isDragging ? 'shadow-xl border-teal-400 scale-[1.02] z-50' : 'border-slate-200 shadow-sm hover:border-slate-300'
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                             <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <div className={`h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0`}>
                             <Category.icon className={`h-5 w-5 ${Category.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${Category.color} bg-current/10 border border-current/20`}>
                                 {Category.label}
                               </span>
                               <span className="text-[10px] text-slate-400 font-mono truncate opacity-60">ID: {item.id}</span>
                             </div>
                             <p className="text-sm font-medium text-slate-900 truncate mt-0.5">{item.url}</p>
                          </div>

                          <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={item.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                               <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemove(item.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-50"
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {media.length > 0 && (
         <p className="text-[11px] text-slate-400 text-center font-medium italic">
           {t("media_drag_tip")}
         </p>
      )}
    </div>
  )
}
