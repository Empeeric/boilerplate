#include "stdafx.h"
#include <windows.h> 
#include <stdio.h> 
#include <tchar.h>
#include <strsafe.h>

#include "Account.h"

#define BUFSIZE 512
 
DWORD WINAPI InstanceThread(LPVOID); 
VOID GetAnswerToRequest( LPTSTR pchRequest, LPTSTR pchReply, LPDWORD pchBytes );
//int ConvertMessageToInt(TCHAR * Message, Position* NewPosition, DWORD pchBytes);
int ConvertData64toPosition(Position* NewPosition, ShadowPosition* NewPosition64);
extern Account MyAccount;

// Temp!!
bool GlobalNewPosMessage = false;

DWORD WINAPI ComserverThread(LPVOID lpvParam)
{ 
   BOOL   fConnected = FALSE; 
   DWORD  dwThreadId = 0; 
   HANDLE hPipe = INVALID_HANDLE_VALUE, hThread = NULL; 
   LPTSTR lpszPipename = TEXT("\\\\.\\pipe\\mynamedpipe"); 
 
// The main loop creates an instance of the named pipe and 
// then waits for a client to connect to it. When the client 
// connects, a thread is created to handle communications 
// with that client, and this loop is free to wait for the
// next client connect request. It is an infinite loop.
 
   for (;;) 
   { 
      _tprintf( TEXT("\nPipe Server: Main thread awaiting client connection on %s\n"), lpszPipename);
      hPipe = CreateNamedPipe( 
          lpszPipename,             // pipe name 
          PIPE_ACCESS_DUPLEX,       // read/write access 
          PIPE_TYPE_MESSAGE |       // message type pipe 
          PIPE_READMODE_MESSAGE |   // message-read mode 
          PIPE_WAIT,                // blocking mode 
          PIPE_UNLIMITED_INSTANCES, // max. instances  
          BUFSIZE,                  // output buffer size 
          BUFSIZE,                  // input buffer size 
          0,                        // client time-out 
          NULL);                    // default security attribute 

      if (hPipe == INVALID_HANDLE_VALUE) 
      {
          _tprintf(TEXT("CreateNamedPipe failed, GLE=%d.\n"), GetLastError()); 
          return -1;
      }
 
      // Wait for the client to connect; if it succeeds, 
      // the function returns a nonzero value. If the function
      // returns zero, GetLastError returns ERROR_PIPE_CONNECTED. 
 
      fConnected = ConnectNamedPipe(hPipe, NULL) ? 
         TRUE : (GetLastError() == ERROR_PIPE_CONNECTED); 
 
      if (fConnected) 
      { 
         printf("Client connected, creating a processing thread.\n"); 
      
         // Create a thread for this client. 
         hThread = CreateThread( 
            NULL,              // no security attribute 
            0,                 // default stack size 
            InstanceThread,    // thread proc
            (LPVOID) hPipe,    // thread parameter 
            0,                 // not suspended 
            &dwThreadId);      // returns thread ID 


		 printf("Treade %d created\n", dwThreadId);

         if (hThread == NULL) 
         {
            _tprintf(TEXT("CreateThread failed, GLE=%d.\n"), GetLastError()); 
            return -1;
         }
         else CloseHandle(hThread); 
       } 
      else 
        // The client could not connect, so close the pipe. 
         CloseHandle(hPipe); 
   } 

   return 0; 
} 
 
DWORD WINAPI InstanceThread(LPVOID lpvParam)
// This routine is a thread processing function to read from and reply to a client
// via the open pipe connection passed from the main loop. Note this allows
// the main loop to continue executing, potentially creating more threads of
// of this procedure to run concurrently, depending on the number of incoming
// client connections.
{ 
   HANDLE hHeap      = GetProcessHeap();
   TCHAR* pchRequest = (TCHAR*)HeapAlloc(hHeap, 0, BUFSIZE*sizeof(TCHAR));
   TCHAR* pchReply   = (TCHAR*)HeapAlloc(hHeap, 0, BUFSIZE*sizeof(TCHAR));

   DWORD cbBytesRead = 0, cbReplyBytes = 0, cbWritten = 0; 
   BOOL fSuccess = FALSE;
   HANDLE hPipe  = NULL;

   // Do some extra error checking since the app will keep running even if this
   // thread fails.

   if (lpvParam == NULL)
   {
       printf( "\nERROR - Pipe Server Failure:\n");
       printf( "   InstanceThread got an unexpected NULL value in lpvParam.\n");
       printf( "   InstanceThread exitting.\n");
       if (pchReply != NULL) HeapFree(hHeap, 0, pchReply);
       if (pchRequest != NULL) HeapFree(hHeap, 0, pchRequest);
       return (DWORD)-1;
   }

   if (pchRequest == NULL)
   {
       printf( "\nERROR - Pipe Server Failure:\n");
       printf( "   InstanceThread got an unexpected NULL heap allocation.\n");
       printf( "   InstanceThread exitting.\n");
       if (pchReply != NULL) HeapFree(hHeap, 0, pchReply);
       return (DWORD)-1;
   }

   if (pchReply == NULL)
   {
       printf( "\nERROR - Pipe Server Failure:\n");
       printf( "   InstanceThread got an unexpected NULL heap allocation.\n");
       printf( "   InstanceThread exitting.\n");
       if (pchRequest != NULL) HeapFree(hHeap, 0, pchRequest);
       return (DWORD)-1;
   }

   // Print verbose messages. In production code, this should be for debugging only.
   printf("InstanceThread created, receiving and processing messages.\n");

// The thread's parameter is a handle to a pipe object instance. 
 
   hPipe = (HANDLE) lpvParam; 

// Loop until done reading
   while (1) 
   { 
   // Read client requests from the pipe. This simplistic code only allows messages
   // up to BUFSIZE characters in length.
      fSuccess = ReadFile( 
         hPipe,        // handle to pipe 
         pchRequest,    // buffer to receive data 
         BUFSIZE*sizeof(TCHAR), // size of buffer 
         &cbBytesRead, // number of bytes read 
         NULL);        // not overlapped I/O 

      if (!fSuccess || cbBytesRead == 0)
      {   
          if (GetLastError() == ERROR_BROKEN_PIPE)
          {
              _tprintf(TEXT("InstanceThread: client disconnected.\n"), GetLastError()); 
          }
          else
          {
              _tprintf(TEXT("InstanceThread ReadFile failed, GLE=%d.\n"), GetLastError()); 
          }
          break;
      }

   // Process the incoming message.
      GetAnswerToRequest(pchRequest, pchReply, &cbReplyBytes); 
 
   // Write the reply to the pipe. 
      fSuccess = WriteFile( 
         hPipe,        // handle to pipe 
         pchReply,     // buffer to write from 
         cbReplyBytes, // number of bytes to write 
         &cbWritten,   // number of bytes written 
         NULL);        // not overlapped I/O 

      if (!fSuccess || cbReplyBytes != cbWritten)
      {   
          _tprintf(TEXT("InstanceThread WriteFile failed, GLE=%d.\n"), GetLastError()); 
          break;
      }
  }

// Flush the pipe to allow the client to read the pipe's contents 
// before disconnecting. Then disconnect the pipe, and close the 
// handle to this pipe instance. 
 
   FlushFileBuffers(hPipe); 
   DisconnectNamedPipe(hPipe); 
   CloseHandle(hPipe); 

   HeapFree(hHeap, 0, pchRequest);
   HeapFree(hHeap, 0, pchReply);

   printf("InstanceThread exitting.\n");
   return 1;
}

VOID GetAnswerToRequest( LPTSTR pchRequest, 
                         LPTSTR pchReply, 
                         LPDWORD pchBytes )
// This routine is a simple function to print the client request to the console
// and populate the reply buffer with a default data string. This is where you
// would put the actual client request processing code that runs in the context
// of an instance thread. Keep in mind the main thread will continue to wait for
// and receive other client connections while the instance thread is working.
{
    _tprintf( TEXT("Client Request String:\"%s\"\n"), pchRequest );

	/*
    // Check the outgoing message to make sure it's not too long for the buffer.
    if (FAILED(StringCchCopy( pchReply, BUFSIZE, TEXT("default answer from server") )))
    {
        *pchBytes = 0;
        pchReply[0] = 0;
        printf("StringCchCopy failed, no outgoing message.\n");
        return;
    }
	*/


	if ( !wcscmp(pchRequest,TEXT("GetAccountCash")) )
	{
		//TCHAR CashW;
		_itow_s((int)(100*MyAccount.Cash),pchReply ,20, 10);
	}
	else if ( !wcscmp(pchRequest,TEXT("GetAccountBalance")) )
	{
		//TCHAR BalanceW;
		_itow_s((int)(100*MyAccount.Balance),pchReply ,20, 10);
	}
	else if ( !wcscmp(pchRequest,TEXT("GetAccountInvstedCapital")) )	// should be changed to "GetPortfolioValue"
	{
		//TCHAR BalanceW;
		_itow_s((int)(100*MyAccount.InvestedMarketValue),pchReply ,20, 10);
	}
	else if ( !wcscmp(pchRequest,TEXT("NewPos")) )
	{
		GlobalNewPosMessage = true;
		StringCchCopy( pchReply, BUFSIZE, TEXT("OK") );
	}
	else
	{
		if ( GlobalNewPosMessage )
		{
			GlobalNewPosMessage = false;

			StringCchCopy( pchReply, BUFSIZE, TEXT("got New Pos data") );

			// Message to Pos
			Position NewPos;
			int PosSize = sizeof(ShadowPosition);
			ShadowPosition NewPos64;
			memcpy(&NewPos64, pchRequest, PosSize);
			ConvertData64toPosition(&NewPos, &NewPos64);
		
			// Add to Portfolio
			int Rst = MyAccount.EnterNewPosToPortfolio( &NewPos );
		
			if ( Rst == 0 )
			{
				// Update Balance
				MyAccount.NewPosUpdateBalance( &NewPos );	
			}
			else
			{
				printf("error in EnterNewPosToPortfolio. Error:%d\n", Rst);
			}
		}
	}

    *pchBytes = (lstrlen(pchReply)+1)*sizeof(TCHAR);
}


int ConvertData64toPosition(Position* NewPosition, ShadowPosition* NewPosition64)
{
	Position NewTempPosition;
	ShadowPosition NewTempPosition64 = (*NewPosition64);

	NewTempPosition.VestingPeriod		= NewTempPosition64.VestingPeriod;

	//char PositionName[128];
	NewTempPosition.EnterDateInt		= NewTempPosition64.EnterDateInt ;
	NewTempPosition.EnterTimeInt		= NewTempPosition64.EnterTimeInt ;
	NewTempPosition.MatuirityDateInt	= NewTempPosition64.MatuirityDateInt ;
	NewTempPosition.MatuirityTimeInt	= NewTempPosition64.MatuirityTimeInt ;
	NewTempPosition.MarketValue			= ((double) NewTempPosition64.MarketValue) / 100 ;

	// Asset1 (Fix)
	//char	BaseAsset1Name[128] = ;
	NewTempPosition.Asset1MarketValue			= ((double) NewTempPosition64.Asset1MarketValue) / 100;
	NewTempPosition.Asset1ExecutedPriceEnter	= ((double) NewTempPosition64.Asset1ExecutedPriceEnter) / 100;
	NewTempPosition.Asset1ExecutedPriceExit		= ((double) NewTempPosition64.Asset1ExecutedPriceExit) / 100 ;

	// Asset2 (Der)
	//char	BaseAsset2Name[128] = ;
	NewTempPosition.Asset2MarketValue			= ((double)  NewTempPosition64.Asset2MarketValue) / 100;
	NewTempPosition.Asset2ExecutedPriceEnter	= ((double) NewTempPosition64.Asset2ExecutedPriceEnter) / 100;
	NewTempPosition.Asset2ExecutedPriceExit	= ((double) NewTempPosition64.Asset2ExecutedPriceExit) / 100;

	NewTempPosition.ExecutionStatus = NewTempPosition64.ExecutionStatus ;

	// handle product
	NewTempPosition.Product.Capital				= ((double) NewTempPosition64.Product.Capital) / 100;
	NewTempPosition.Product.ProtectionRatio		= ((double) NewTempPosition64.Product.ProtectionRatio) / 10000;
	NewTempPosition.Product.ProtectedCapital		= ((double) NewTempPosition64.Product.ProtectedCapital) / 100;
	NewTempPosition.Product.StockIndexType		= NewTempPosition64.Product.StockIndexType;
	NewTempPosition.Product.BaseCurrency			= NewTempPosition64.Product.BaseCurrency;
	NewTempPosition.Product.DerCurrency			= NewTempPosition64.Product.DerCurrency;
	NewTempPosition.Product.ProtectionType		= NewTempPosition64.Product.ProtectionType;
	NewTempPosition.Product.ExcatTime				= (bool) NewTempPosition64.Product.ExcatTime;
	NewTempPosition.Product.RequiredTimeToExpire	= ((double) NewTempPosition64.Product.RequiredTimeToExpire) / 100;		
	NewTempPosition.Product.CurrencyRatioAtEnter	= ((double) NewTempPosition64.Product.CurrencyRatioAtEnter) / 100;

	// Market Params
	NewTempPosition.Product.CurrencyRatio			= ((double) NewTempPosition64.Product.CurrencyRatio) / 10000;
	NewTempPosition.Product.StockIndexValue		= ((double) NewTempPosition64.Product.StockIndexValue) / 100;
	NewTempPosition.Product.MarketValue			= ((double) NewTempPosition64.Product.MarketValue) / 100;

	// Other Params
	NewTempPosition.Product.MaxSpotMinusIP		= ((double) NewTempPosition64.Product.MaxSpotMinusIP) / 100;
	
	// (Output)
	NewTempPosition.Product.DerTypes			= NewTempPosition64.Product.DerTypes ;
	NewTempPosition.Product.DerStrike			= ((double) NewTempPosition64.Product.DerStrike) / 100 ;
	NewTempPosition.Product.DerExpireDate			= NewTempPosition64.Product.DerExpireDate;
	NewTempPosition.Product.NumOfDerNotes			= NewTempPosition64.Product.NumOfDerNotes ;
	NewTempPosition.Product.DerPriceAtEnter		= ((double) NewTempPosition64.Product.DerPriceAtEnter) / 100;

	NewTempPosition.Product.NumOfBonds			= NewTempPosition64.Product.NumOfBonds;
	NewTempPosition.Product.BondType			= NewTempPosition64.Product.BondType;
	NewTempPosition.Product.BondPriceAtEnter	= ((double) NewTempPosition64.Product.BondPriceAtEnter) / 100;

	NewTempPosition.Product.ReferenceYield		= ((double) NewTempPosition64.Product.ReferenceYield) / 10000;
	NewTempPosition.Product.TimeToExpire			= ((double) NewTempPosition64.Product.TimeToExpire) / 100;				
	
	strcpy_s(NewTempPosition.Product.ProductName, NewTempPosition64.Product.ProductName);

	printf("Product Name:%s\n", NewTempPosition.Product.ProductName);
	printf("new product capital:%1.2lf\n", NewTempPosition.Product.Capital);
	printf("new product protection ratio:%1.2lf\n", NewTempPosition.Product.ProtectionRatio);
	

	(*NewPosition) = NewTempPosition;

	return 0;
}
