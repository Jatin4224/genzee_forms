"use client";

import { IconPlus } from "@tabler/icons-react";

import { CreateFormDialog } from "~/components/create-form-dialog";
import { FORM_TEMPLATES, FORM_TEMPLATE_IDS, TemplatePreview } from "~/components/form-templates";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

//browsable gallery of the visual styles a form can use. each card starts a new form
//already set to that style, so picking a look and building it is one flow
export function TemplatesGallery() {
  return (
    <div className="grid gap-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
      {FORM_TEMPLATE_IDS.map((id) => {
        const template = FORM_TEMPLATES[id];

        return (
          <Card key={id} className="overflow-hidden pt-0">
            <TemplatePreview
              template={template}
              className="h-64 border-b mask-[linear-gradient(to_bottom,black_70%,transparent)]"
            />
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <CreateFormDialog
                template={id}
                trigger={
                  <Button variant="outline" size="sm">
                    <IconPlus className="size-4" />
                    Create a new form
                  </Button>
                }
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
