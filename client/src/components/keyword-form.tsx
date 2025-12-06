import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Globe, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { batchKeywordSchema, type BatchKeywordInput, COUNTRY_LIST, TIME_FRAME_OPTIONS } from "@shared/schema";
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
      timeFrame: "none",
    },
  });

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
                                  {COUNTRY_LIST.find(c => c.code === field.value)?.name}
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
                                  {country.name}
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

                <FormField
                  control={form.control}
                  name="timeFrame"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Time Frame
                        <Badge variant="secondary" className="text-xs">tbs</Badge>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger 
                            className="h-11"
                            data-testid="select-time-frame"
                          >
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_FRAME_OPTIONS.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              data-testid={`select-time-frame-${option.value}`}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
