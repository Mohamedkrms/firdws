import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bookmark, Loader2, BookOpen } from 'lucide-react';
import { API_URL } from '@/config';
import { Button } from "@/components/ui/button";
import SEO from '@/components/SEO';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function Bookmarks() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = () => {
        axios.get(`${API_URL}/api/bookmarks`)
            .then(response => {
                setBookmarks(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching bookmarks:', error);
                setLoading(false);
            });
    };

    useEffect(() => { fetchBookmarks(); }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-3xl space-y-4">
                <Skeleton className="h-10 w-48 mb-6" />
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8" dir="rtl">
            <SEO
                title="المفضلة"
                description="الآيات التي قمت بحفظها للرجوع إليها لاحقاً."
                url="/bookmarks"
            />
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <Bookmark className="w-7 h-7 text-primary" />
                    المفضلة
                </h2>
                <p className="text-muted-foreground mt-1">آياتك المحفوظة للرجوع إليها لاحقاً</p>
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">لا توجد آيات محفوظة</h3>
                    <div className="mt-4">
                        <Button asChild>
                            <Link to="/">تصفح السور</Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {bookmarks.map(bm => (
                        <Link to={`/surah/${bm.surahNumber}`} key={bm._id}>
                            <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-lg">سورة {bm.surahNumber}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    آية {bm.ayahNumber}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{bm.note}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-1 rounded-full">
                                            {new Date(bm.date).toLocaleDateString('ar-EG', {
                                                month: 'short', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bookmarks;
