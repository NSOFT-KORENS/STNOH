using System;
using System.Collections.Generic;
using System.Linq;
using Siemens.SimaticIT.Unified.Common;
using Siemens.SimaticIT.Unified.Common.Information;
using NSOFT.STNOH.STNOH.DSPOMModel.Commands.Published;
using Siemens.SimaticIT.Handler;
using Siemens.SimaticIT.Unified;
using Siemens.SimaticIT.SDK.Diagnostics.Tracing;
using NSOFT.MasterData.Mail_MS.MSModel.Types;
using NSOFT.STNOH.STNOH.DSPOMModel.DataModel.ReadingModel;

namespace NSOFT.STNOH.STNOH.DSPOMModel.Commands
{
    /// <summary>
    /// Partial class init
    /// </summary>
    [Handler(HandlerCategory.BasicMethod)]
    public partial class NonConformanceSendMailHandlerShell 
    {
        /// <summary>
        /// This is the handler the MES engineer should write
        /// This is the ENTRY POINT for the user in VS IDE
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        /// <remarks>This is a Composite Command Handler</remarks>
        [HandlerEntryPoint]
        private NonConformanceSendMail.Response NonConformanceSendMailHandler(NonConformanceSendMail command)
        {
            ITracer tracer = platform.Tracer;

            tracer.Write("Siemens-SimaticIT-Trace-BusinessLogic",
                 Siemens.SimaticIT.SDK.Diagnostics.Common.Category.Informational, "Send Mail Start : {0}", command.NonConformanceId);


            /* NC Attachment가 NC Defect(또는 Failure)가 생성되고 0.02~0.03초 뒤에 생성이 되는 문제가 있어 
              생성 이후 처리하기 위하여 Slepp 5초 부여함*/
            System.Threading.Thread.Sleep(5000);

            try
            {

                List<MailParameterValue> data = new List<MailParameterValue>();
                List<MailAttachment> data3 = new List<MailAttachment>();


                var row = platform.ProjectionQuery<NonConformance>()
                   .Include("WorkOrder")
                   .Include("WorkOrderOperation")
                   .Include("NonConformanceItems.Tool")
                   .Include("NonConformanceItems.DM_MaterialTrackingUnit.MaterialTrackingUnit")
                   .FirstOrDefault(x => x.Id == command.NonConformanceId);


                tracer.Write("Siemens-SimaticIT-Trace-BusinessLogic",
                 Siemens.SimaticIT.SDK.Diagnostics.Common.Category.Informational, "NC History 조회..");
                List<NonConformanceHistory> ncHistory = platform.ProjectionQuery<NonConformanceHistory>()
                    .Include("Attachments")
                    .ToList()
                    .Where(x => x.NonConformance_Id == command.NonConformanceId)
                    .ToList();

                string mtus = "", tools = "", equipmenets = "";
                string defectOrfailure = "";

                if (ncHistory[ncHistory.Count - 1].Defect != null)
                {

                    DefectType defect = platform.ProjectionQuery<DefectType>().ToList().LastOrDefault(x => x.Id == ncHistory[ncHistory.Count - 1].Defect);

                    if (ncHistory[ncHistory.Count - 1].Action == "ADD DEFECT")
                    {
                        defectOrfailure = defect.NId;
                    }
                    else if (ncHistory[ncHistory.Count - 1].Action == "ADD FAILURE")
                    {
                        defectOrfailure = ncHistory[ncHistory.Count - 1].FailureNId == null ? "" : ncHistory[ncHistory.Count - 1].FailureNId;
                    }
                }
                tracer.Write("Siemens-SimaticIT-Trace-BusinessLogic",
             Siemens.SimaticIT.SDK.Diagnostics.Common.Category.Informational, "Defect(또는 Failure) 조회 완료..");

                if (ncHistory.Where(x => x.Action == "ADD DOCUMENT").Count() > 0)
                {
                    List<NonConformanceAttachment> ncAttachment = platform.ProjectionQuery<NonConformanceAttachment>().ToList().Where(x => x.Nonconformance_Id == command.NonConformanceId).ToList();
                    for (var file = 0; file < ncAttachment.Count; file++)
                    {

                        Document doc = platform.ProjectionQuery<Document>().ToList().SingleOrDefault(x => x.Id == ncAttachment[file].Document);
                        data3.Add(new MailAttachment(doc.FileName, doc.File_Id_Id.ToString()));
                    }
                }

                foreach (var a in row.NonConformanceItems)
                {
                    if (a.Tool != null)
                    {
                        if (tools.Length > 0)
                        {
                            tools += "<br/>" + a.Tool.NId;
                        }
                        else
                        {
                            tools += a.Tool.NId;
                        }
                    }

                    if (a.DM_MaterialTrackingUnit != null)
                    {
                        if (mtus.Length > 0)
                        {
                            mtus += "<br/>" + a.DM_MaterialTrackingUnit.MaterialTrackingUnit.Code;
                        }
                        else
                        {
                            mtus += a.DM_MaterialTrackingUnit.MaterialTrackingUnit.Code;
                        }
                    }

                    if (a.Equipment != null)
                    {
                        if (equipmenets.Length > 0)
                        {
                            equipmenets += "<br/>" + a.Equipment;
                        }
                        else
                        {
                            equipmenets += a.Equipment;
                        }
                    }
                }


                data.Add(new MailParameterValue("Id", row.Id != null ? row.Id.ToString() : ""));
                data.Add(new MailParameterValue("NId", row.NId));
                data.Add(new MailParameterValue("NonConformanceLifecycle", row.NonConformanceLifecycle));
                data.Add(new MailParameterValue("WorkOrder", row.WorkOrder != null ? row.WorkOrder.NId : ""));
                data.Add(new MailParameterValue("WorkOrderOperation", row.WorkOrderOperation != null ? row.WorkOrderOperation.OperationNId : ""));
                data.Add(new MailParameterValue("MaterialTrackingUnits", mtus));
                data.Add(new MailParameterValue("Equipments", equipmenets));
                data.Add(new MailParameterValue("Tools", tools));
                data.Add(new MailParameterValue("DefectORFailure", defectOrfailure));
                data.Add(new MailParameterValue("Note", row.Notes != null ? row.Notes : ""));



                List<MailParameterValue> data2 = new List<MailParameterValue>();
                data2.Add(new MailParameterValue("NCContext", row.Context));
                data2.Add(new MailParameterValue("NCStatus", row.Status));



                SendMail send = new SendMail();
                send.Type = "NC";
                send.ValueList = data;
                send.FilterValueList = data2;
                if (data3.Count != 0)
                    send.AttachmentList = data3;



                var result = platform.CallCommand<SendMail, SendMail.Response>(send);

                tracer.Write("Siemens-SimaticIT-Trace-BusinessLogic",
                   Siemens.SimaticIT.SDK.Diagnostics.Common.Category.Informational, "SendMail 호출, {0}", result.Succeeded);

                return new NonConformanceSendMail.Response { };
            }
            catch (Exception ex)
            {
                tracer.Write("Siemens-SimaticIT-Trace-BusinessLogic",
             Siemens.SimaticIT.SDK.Diagnostics.Common.Category.Error, "Send Mail Error..  Id : {0}, Error : {1}", command.NonConformanceId, ex.Message.ToString());
                return new NonConformanceSendMail.Response { };
            }
        }
    }
}
