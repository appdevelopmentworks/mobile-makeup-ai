'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Eye, 
  Star, 
  Trash2, 
  Download,
  MoreHorizontal,
  Calendar,
  Palette,
  Sparkles
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '../../hooks/use-toast'
import type { HistoryItem } from '@/types/history'

interface HistoryItemProps {
  item: HistoryItem
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export function HistoryItemComponent({ 
  item, 
  onToggleFavorite, 
  onDelete, 
  onView 
}: HistoryItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = () => {
    toast({
      title: '画像をダウンロード',
      description: '分析結果画像をダウンロードしました。',
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MakeupAI分析結果 - ${item.styleName}`,
        text: `${item.faceShape}・${item.skinTone}の分析結果`,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'リンクをコピーしました',
        description: 'URLがクリップボードにコピーされました。',
      })
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {!imageLoaded && (
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-pink-400" />
                </div>
              )}
              <img
                src={item.thumbnailUrl || '/placeholder-face.jpg'}
                alt="分析画像"
                className={`w-full h-full object-cover transition-opacity ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
            
            {/* Favorite Indicator */}
            {item.isFavorite && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="h-3 w-3 text-white fill-current" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.styleName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(item.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    詳細を見る
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleFavorite(item.id)}>
                    <Heart 
                      className={`h-4 w-4 mr-2 ${
                        item.isFavorite ? 'fill-current text-red-500' : ''
                      }`}
                    />
                    {item.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    ダウンロード
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Analysis Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Palette className="h-3 w-3 text-purple-500" />
                <span className="text-gray-600">
                  {item.faceShape} / {item.skinTone}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <Button
            onClick={() => onToggleFavorite(item.id)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <Heart 
              className={`h-4 w-4 ${
                item.isFavorite ? 'fill-current text-red-500' : 'text-gray-400'
              }`}
            />
            <span className="text-xs">
              {item.isFavorite ? 'お気に入り' : 'お気に入りに追加'}
            </span>
          </Button>

          <Button
            onClick={() => onView(item.id)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-1" />
            詳細
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}