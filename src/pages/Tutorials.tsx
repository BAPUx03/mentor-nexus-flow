import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, User, ArrowRight, GraduationCap } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTutorials } from "@/hooks/useTutorials";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function Tutorials() {
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const { data: tutorials, isLoading } = useTutorials({ published: true, difficulty });

  const difficulties = ["beginner", "intermediate", "advanced"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Tutorials
          </h1>
          <p className="text-lg text-muted-foreground">
            Step-by-step guides to help you master new skills and technologies.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={difficulty === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficulty(undefined)}
          >
            All
          </Button>
          {difficulties.map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(d)}
              className="capitalize"
            >
              {d}
            </Button>
          ))}
        </div>

        {/* Tutorials Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tutorials && tutorials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.id} to={`/tutorials/${tutorial.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  {tutorial.featured_image && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={tutorial.featured_image}
                        alt={tutorial.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={difficultyColors[tutorial.difficulty]}>
                        {tutorial.difficulty}
                      </Badge>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.estimated_minutes} min
                      </span>
                      {tutorial.is_paid ? (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          ₹{tutorial.price}
                        </Badge>
                      ) : tutorial.external_link && (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Free
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-xl font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {tutorial.title}
                    </h2>

                    {tutorial.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {tutorial.description}
                      </p>
                    )}

                    {tutorial.tags && tutorial.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tutorial.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {tutorial.author?.full_name || "Anonymous"}
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No tutorials found.</p>
            <p className="text-muted-foreground text-sm mt-2">
              {difficulty ? "Try a different difficulty level." : "Check back soon for new content!"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
