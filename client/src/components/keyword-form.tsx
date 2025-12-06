import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Globe, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { batchKeywordSchema, type BatchKeywordInput, type TimeRange, COUNTRY_LIST } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeywordFormProps {
  onSubmit: (data: BatchKeywordInput) => void;
  isLoading?: boolean;
}

export function KeywordForm({ onSubmit, isLoading = false }: KeywordFormProps) {
  const form = useForm<BatchKeywordInput>({
    resolver: zodResolver(batchKeywordSchema),
    defaultValues: {
      keywords: "",
      websiteUrl: "",
      country: "us",
      compareEnabled: false,
      compareTimeRange: "week",
    },
  });

  const compareEnabled = form.watch("compareEnabled");
  const keywordsValue = form.watch("keywords");
  const keywordCount = keywordsValue
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  const handleSubmit = (data: BatchKeywordInput) => {
    onSubmit(data);
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Track Keyword Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      Keywords
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter keywords (one per line)&#10;e.g., apple inc&#10;best smartphones 2024&#10;tech news today"
                        className="min-h-32 resize-none"
                        data-testid="input-keywords"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {keywordCount} keyword{keywordCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Website URL to Track
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.example.com"
                          className="h-11"
                          data-testid="input-website-url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Country
                        <Badge variant="secondary" className="text-xs">gl</Badge>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger 
                            className="h-11"
                            data-testid="select-country"
                          >
                            <SelectValue placeholder="Select a country">
                              {field.value && (
                                <span className="flex items-center gap-2">
                                  <span className="uppercase font-medium text-xs">{field.value}</span>
                                  {COUNTRY_LIST.find(c => c.code === field.value)?.name} ({field.value})
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-72">
                            {COUNTRY_LIST.map((country) => (
                              <SelectItem 
                                key={country.code} 
                                value={country.code}
                                data-testid={`select-country-${country.code}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="uppercase font-medium text-xs w-6">{country.code}</span>
                                  {country.name} ({country.code})
                                </span>
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="compare-mode" className="text-sm font-medium cursor-pointer">
                        Compare with Previous Period
                      </Label>
                    </div>
                    <FormField
                      control={form.control}
                      name="compareEnabled"
                      render={({ field }) => (
                        <Switch
                          id="compare-mode"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-compare-mode"
                        />
                      )}
                    />
                  </div>

                  {compareEnabled && (
                    <FormField
                      control={form.control}
                      name="compareTimeRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Compare Time Range</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger 
                                className="h-11"
                                data-testid="select-compare-time-range"
                              >
                                <SelectValue placeholder="Select time range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="week">Past Week</SelectItem>
                              <SelectItem value="month">Past Month</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="px-8"
                data-testid="button-check-rankings"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Rankings...
                  </>
                ) : (
                  <>
                    Check Rankings
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
