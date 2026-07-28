import { and, db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formSubmissionTable } from "@repo/database/models/form-submission";

import {
  type CreateSubmissionInputType,
  type ListSubmissionsByFormIdInputType,
  createSubmissionInput,
  listSubmissionsByFormIdInput,
} from "./model";

class FormSubmissionService {
  //public: anyone with the link can submit, so no ownership check here
  public async createSubmission(payload: CreateSubmissionInputType) {
    const { formId, values } = await createSubmissionInput.parseAsync(payload);

    const result = await db
      .insert(formSubmissionTable)
      .values({
        formId,
        values,
      })
      .returning({
        id: formSubmissionTable.id,
      });

    const createdSubmission = result[0];
    if (!createdSubmission) throw new Error(`something went wrong while creating a submission`);

    return {
      id: createdSubmission.id,
    };
  }

  //only the owner of the form may read its responses
  public async listSubmissionsByFormId(payload: ListSubmissionsByFormIdInputType) {
    const { formId, userId } = await listSubmissionsByFormIdInput.parseAsync(payload);

    const ownedForm = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!ownedForm[0]) throw new Error(`Form not found or you do not have access to it`);

    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    return submissions;
  }
}

export default FormSubmissionService;
